import { AutoEnrol, Role, User } from "@prisma/client";
import { generateId, Session } from "lucia";
import { createDate, isWithinExpirationDate, TimeSpan } from "oslo";
import { encodeHex } from "oslo/encoding";
import { alphabet, generateRandomString, sha256 } from "oslo/crypto";
import { db } from "~config/prisma";
import { lucia } from "~config/lucia";
import { Resend } from "resend";
import consts from "~config/consts";
import { PrismaUserWithProfile } from "~modules/users/users.model";
import { getDeviceIdentifier } from "~utils/utilities";


class AuthService {
    private static instance: AuthService;
    private resend: Resend;

    constructor(){
        this.resend = new Resend(String(Bun.env.RESEND_API_KEY));
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        
        return AuthService.instance;
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
    async createLuciaSession(userId:string, headers: Headers, profileId?: string|null, rememberMe?:boolean):Promise<Session>{
        // const userAgent = headers.get('user-agent');
        // const userAgentHash = (userAgent ? Buffer.from(userAgent).toString('base64') : "Unknown");

        const ip = headers.get('x-forwarded-for') || headers.get('remote-addr') || headers.get('host') || 'Unknown';
        // const ipHash = Buffer.from(ip).toString('hex');

        const os = headers.get('os') ?? 'Unknown';
        // const osHash = (os ? Buffer.from(os).toString('base64') : "Unknown");
        const authMethod:string = headers.get('X-Client-Type') ?? "Unknown";
        const ipCountry = headers.get('ipCountry') ?? "Unknown";

        const deviceIdentifier = getDeviceIdentifier(headers);

        return lucia.createSession(userId, {
            ipCountry: ipCountry,
            os: os,
            ip: ip,
            // host: headers.get('host') ?? 'Unknown',
            // userAgentHash: userAgentHash,
            fresh: true,
            expiresAt: createDate(new TimeSpan(1 + (rememberMe ? 6 : 0), "d")),
            activeExpires: Date.now() + ( 1000 * 60 * (rememberMe ? 60 : 1)),
            deviceIdentifier: deviceIdentifier,
            authType: authMethod
        })
    }

    /** Dynamic Auth Session (JWT|Cookie)
     * Encodes user data and creates auth session via Lucia Auth v3
     * */ 
    createDynamicSession = async (
        authMethod:'JWT'|'Cookie',
        jwt:any,
        user:Partial<User>,
        headers: Headers,
        rememberMe?:boolean
    ) => {
        console.debug(`[AuthService] ${user.email} attempting log in via ${authMethod}`);

        try {
            if(authMethod === 'JWT'){
                const jwtExpiresIn = (rememberMe ? consts.auth.jwtMaxAge : consts.auth.jwtMinAge) +'d'; // in days

                // Generate access token (JWT) using logged-in user's details
                const accessToken = await jwt.sign({
                    id: user.id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    username: user.username,
                    roles: user.roles,
                    emailVerified: user.emailVerified,
                    createdAt: user.createdAt,
                    profileId: user.profileId ?? null
                }, { expiresIn:jwtExpiresIn});

                await this.createLuciaSession(user.id!, headers, user?.profileId ?? null, rememberMe);

                return accessToken;
            } else if (authMethod === 'Cookie'){

                // Generate a unique identifier for the device (e.g., based on headers or other data)
                const deviceIdentifier = getDeviceIdentifier(headers);

                const sameDeviceSession = await db.session.findFirst({
                    where: {
                        userId: user.id,
                        deviceIdentifier: deviceIdentifier ?? null,
                    }
                });
    
                // Invalidate any existing session for this user on the same device
                if (sameDeviceSession) {
                    await lucia.invalidateSession(sameDeviceSession.id);
                    // jwt.sign(null);
                }

                const {id} = await this.createLuciaSession(user.id!, headers, user?.profileId ?? null, rememberMe);
                const sessionCookie = lucia.createSessionCookie(id);
                return sessionCookie;
            }
        } catch (error) {
            console.error(error);
            
            throw error;
        }
    }

    async createJWTs(payload: any, jwt:any, rememberMe?:boolean): Promise<{ accessToken:string, refreshToken:string }> {
        const jwtExpiresIn = (rememberMe ? consts.auth.jwtMaxAge : consts.auth.jwtMinAge) +'d'; // in days

        const accessToken = await jwt.sign(payload, { expiresIn:jwtExpiresIn});
    
        const refreshToken = await jwt.sign(payload, { expiresIn: '1d' });
    
        return { accessToken, refreshToken };
    }

    async refreshTokens(refreshToken: string, jwt:any, rememberMe?:boolean): Promise<{ accessToken:string, refreshToken:string }> {
        // Validate the refresh token
        const payload = await jwt.verify(refreshToken);
        if (!payload) throw new Error('Invalid refresh token');
    
        // Issue new tokens
        const newTokens = await this.createJWTs(payload, jwt, rememberMe);
        return newTokens;
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
        let oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        return db.emailVerificationCode.deleteMany({
            where: { expiresAt: { lte: oneDayAgo } }
        });
    }
}

export default AuthService;