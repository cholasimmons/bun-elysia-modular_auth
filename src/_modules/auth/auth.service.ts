import { AutoEnrol, Role, User } from "@prisma/client";
import { TimeSpan, generateId } from "lucia";
import { createDate, isWithinExpirationDate } from "oslo";
import { encodeHex } from "oslo/encoding";
import { alphabet, generateRandomString, sha256 } from "oslo/crypto";
import { db } from "~config/prisma";
import { lucia } from "~config/lucia";
import { Resend } from "resend";
import consts from "~config/consts";


const today = new Date();
// today.setHours(0, 0, 0, 0); // Set time to midnight to represent the start of today

const oneDayAgo = new Date();
oneDayAgo.setDate(oneDayAgo.getDate() - 1);
const resend = new Resend(process.env.RESEND_API_KEY);

// const nextYear = today.getUTCFullYear() + 1;
// today.setFullYear(nextYear)

export default class AuthService {
    async login(email: string, password: string, rememberme:boolean, ctx: any){
        const { request: {headers}, set} = ctx;
        
        try {
            
            return { data: null };

        } catch (err) {
            console.error("[AUTH SERVICE] ",err);
            
            throw err;
        }
    }

    async sanitizeUserObject(user: User, opts?:{id?:boolean, verified?:boolean, active?:boolean}){
        const cleanUser = {
            id: opts?.id ? user.id : null,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone,
            roles: user.roles,
            emailVerified: opts?.verified ? user.emailVerified : null,
            isActive: opts?.active ? user.isActive : null,
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
                email.length < (consts.server.passwordMinLength ?? 8) || email.length > 32) && emailRegex.test(email)
            ) {
                throw 'Email is not valid';
            }

            if (
                typeof password !== "string" ||
                password.length < (consts.server.passwordMinLength ?? 8) || password.length > 32
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

    async createLuciaSession(userId:string, headers: Headers, profileId?: string, rememberMe:boolean = false){
        const userAgent = headers.get('host') ?? "localhost";
        const userAgentHash = await Bun.hash(userAgent);

        return await lucia.createSession(userId, {
            ipCountry: headers.get('ipCountry'),
            os: headers.get('os'),
            host: headers.get('host'),
            userAgentHash: userAgentHash.toString(),
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
            await resend.emails.send({
                from: 'info@simmons.studio', // 'onboarding@resend.dev',
                to: 'simmonsfrank@gmail.com',
                subject: 'Verification Code | BusPlus',
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

        console.debug("Database Code: ",databaseCode);

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
        // TODO: Implement this!!!
        console.warn(`Password reset token to be sent to ${email}: ${verificationLink}`);

        try {
            await resend.emails.send({
                from: 'info@simmons.studio', //'onboarding@resend.dev',
                to: 'simmonsfrank@gmail.com',
                subject: 'hello passengers',
                html: `User email: <strong>${email}</strong><br>
                    <a href="${verificationLink}">Reset your password</a>`,
            });
        } catch (error) {
            console.error(error);
            
            throw 'Could not send email'
        }
    }

    async validateEnrollment(registrationEmail:string): Promise<Partial<AutoEnrol>|null> {
        console.warn(`validating new registration...`);

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

    static async clearExpiredEmailVerificationCodes(){
        return db.emailVerificationCode.deleteMany({
            where: { expiresAt: { lte: oneDayAgo } }
        });
    }
}