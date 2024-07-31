import { AutoEnrol, Role, User } from "@prisma/client";
import { generateId, Session } from "lucia";
import { createDate, isWithinExpirationDate, TimeSpan } from "oslo";
import { encodeHex } from "oslo/encoding";
import { alphabet, generateRandomString, sha256 } from "oslo/crypto";
import { db } from "~config/prisma";
import { lucia } from "~config/lucia";
import { Resend } from "resend";
import consts from "~config/consts";


// const nextYear = today.getUTCFullYear() + 1;
// today.setFullYear(nextYear)

class AuthService {
    private static instance: AuthService;

    private today: Date;
    // today.setHours(0, 0, 0, 0); // Set time to midnight to represent the start of today
    private oneDayAgo: Date;
    private resend = new Resend(Bun.env.RESEND_API_KEY);

    constructor(){
        this.today = this.oneDayAgo = new Date();
        this.oneDayAgo.setDate(this.oneDayAgo.getDate() - 1);
        this.resend = new Resend(Bun.env.RESEND_API_KEY ?? '1234');
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        
        return AuthService.instance;
    }


    // Clean full User object, removing sessions, password, OAuth IDs and profile
    async sanitizeUserObject(user: User, opts?:{id?:boolean, verified?:boolean, active?:boolean, comment?:boolean}){
        const cleanUser: Partial<User> = {
            id: opts?.id ? user.id : undefined,
            firstname: user.firstname,
            lastname: user.lastname,
            roles: user.roles,
            email: user.email,
            emailVerified: opts?.verified ? user.emailVerified : undefined,
            phone: user.phone,
            profileId: user.profileId,
            isActive: opts?.active ? user.isActive : undefined,
            isComment: opts?.comment ? user.isComment : undefined,
            createdAt: user.createdAt
        };

        return cleanUser;
    }

    /**Validate email and password */
    validateCredentials(email:string, password:string, confirmPassword?:string){
        const emailRegex = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/;

        try {
            // basic check
            if ( 
                (typeof email !== "string" || 
                email.length < (consts.auth.passwordMinLength ?? 8) || email.length > 32) && emailRegex.test(email)
            ) {
                throw 'Email is not valid';
            }

            if (
                typeof password !== "string" ||
                password.length < (consts.auth.passwordMinLength ?? 8) || password.length > 32
            ) {
                throw 'Invalid password format';
            }

            if(confirmPassword && confirmPassword !== password){
                throw 'Passwords do not match';
            }
        } catch (error) {
            throw error;
        }
    }

    // Encodes user data and creates auth session via Lucia Auth v3
    async createLuciaSession(userId:string, headers: Headers, profileId?: string, rememberMe:boolean = false):Promise<Session>{
        const userAgent = headers.get('user-agent');
        const userAgentHash = (userAgent ? Buffer.from(userAgent).toString('base64') : "Unknown");

        const os = headers.get('os');
        const osHash = (os ? Buffer.from(os).toString('base64') : "Unknown");

        return lucia.createSession(userId, {
            ipCountry: headers.get('ipCountry') ?? 'Unknown',
            os: osHash,
            host: headers.get('host') ?? 'Unknown',
            userAgentHash: userAgentHash,
            fresh: true,
            expiresAt: createDate(new TimeSpan(1 + (rememberMe ? 6 : 0), "d")),
            activeExpires: Date.now() + ( 1000 * 60 * (rememberMe ? 60 : 1))
        })
    }

    async generateEmailVerificationCode(userId: string, email: string): Promise<string> {
        console.log(`Generating ${consts.verificationCode.length}-digit Email Verification Code...`);
        
        await db.emailVerificationCode.deleteMany({ where: { userId: userId} });
        const code = generateRandomString(consts.verificationCode.length, alphabet("0-9", "a-z")).toUpperCase();
        await db.emailVerificationCode.create({
            data: {
                userId,
                email,
                code,
                expiresAt: createDate(new TimeSpan(1, "h")) // 1 hour
            }
        });
        return code;
    }

    async sendEmailVerificationCode(email:string, verificationCode:string){
        console.log(`Sending ${verificationCode} to ${email}`);
        // TODO: Implement timeout to limit the resends

        try {
            await this.resend.emails.send({
                from: 'onboarding@resend.dev',
                to: email,
                subject: 'Your Verification Code',
                html: `<strong>
                    ${email}<br>
                    ${verificationCode}<br>
                    <a href="http://${Bun.env.HOST}:3000/v1/auth/email-verification/${verificationCode}?email=${email}">Verify Account</a>
                </strong>`,
            });
        } catch (error) {
            console.error(error);
            
            throw 'Could not send email with verification code'
        }
    }

    async verifyVerificationCode(user: User, _code:string):Promise<boolean>{
        await db.$connect();

        const databaseCode = await db.emailVerificationCode.findUnique({ where: { userId: user.id }, select: { code: true, expiresAt: true, email: true } })
        if (!databaseCode || databaseCode.code !== _code) {
            await db.$disconnect();
            return false;
        }

        await db.emailVerificationCode.deleteMany({ where: { code: _code } });
        await db.$disconnect();

        if (!isWithinExpirationDate(databaseCode.expiresAt)) {
            return false;
        }
        if (databaseCode.email !== user.email) {
            return false;
        }
        return true;

    }

    health(){
        console.log('Auth Service working ok! HEALTH');
        
        return 'Auth Service working ok! HEALTH'
    }


    async createPasswordResetToken(userId: string): Promise<string> {
        // optionally invalidate all existing tokens
        await db.passwordResetToken.deleteMany({ where: { userId: userId } });
        const tokenId = generateId(40);
        const tokenHash = encodeHex(await sha256(new TextEncoder().encode(tokenId)));
        await db.passwordResetToken.create({ data: {
            tokenHash: tokenHash,
            userId: userId,
            expiresAt: createDate(new TimeSpan(30, "m")) // 30 minutes
        }
        });
        return tokenId;
    }

    async sendPasswordResetToken(email:string, verificationLink:string) {
        console.debug(`Password reset token to be sent to ${email}: ${verificationLink}`);

        try {
            await this.resend.emails.send({
                from: 'onboarding@resend.dev',
                to: email,
                subject: 'Hello User',
                html: `User email: <strong>${email}</strong><br>
                    <a href="${verificationLink}">Reset your password</a>`,
            });
        } catch (error) {
            console.error(error);
            
            throw 'Could not send email'
        }
    }

    async validateAutoEnrollment(registrationEmail:string): Promise<Partial<AutoEnrol>|null> {
        console.debug(`validating new registration...`);

        try {
            const enroller = await db.autoEnrol.findFirst({
                where: { email: registrationEmail, isActive: true },
                select: { email: true, phone: true, names: true, roles: true, supportLevel: true }
            });

            if(enroller){
                enroller.roles.unshift(Role.GUEST);
                return enroller;
            }

            return null;
        } catch (error) {
            console.error(error);
            
            throw 'Could not fetch auto-enrolled items'
        }
    }

    async clearExpiredEmailVerificationCodes(){
        return db.emailVerificationCode.deleteMany({
            where: { expiresAt: { lte: this.oneDayAgo } }
        });
    }
}

export default AuthService;