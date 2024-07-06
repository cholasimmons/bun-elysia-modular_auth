import { lucia } from "~config/lucia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { db } from "~config/prisma";
import { generateId } from "lucia";
import { encodeHex } from "oslo/encoding";
import { sha256 } from "oslo/crypto";
import { isWithinExpirationDate } from "oslo";
import { AuthService } from ".";
import { Role, User } from "@prisma/client";
import consts from "~config/consts";
import { OAuth2Providers } from "./auth.models";


const url = `${Bun.env.NODE_ENV === 'production' ? 'https' : 'http'}://${Bun.env.HOST ?? 'localhost'}:${Bun.env.PORT ?? 3000}/v${consts.api.version}`;
class AuthController {
    routes = [];
  
    constructor(public authService: AuthService) {
      // super('/auth');
    }

    root({ cookie }: any):string{
        // console.log('cookie: ',cookie);
        return 'Nothing to see here :)'
    }

    loginForm({ request:{ headers }}: any){
        const isBrowser = headers.get('accept').includes('text/html');

        return isBrowser ? Bun.file('public/login.html') : { message: 'Use POST instead'}
    }

    async login({ set, request:{headers}, body: {email, password, rememberme}, cookie:{ cookieName }, authJWT, params }: any){

        try {
            // Check if the Authentication-Method header is present
            const authMethod = headers.get('Authentication-Method') ?? null;

            if (!authMethod) {                
                // If the header is missing, return an error response
                set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
                return { success: false, message: "Authentication method not specified", data: null };
            }

            authService.validateCredentials(email.toLowerCase(), password)

            // find user by Key, and validate password
            const userExists = await db.user.findUnique({ where: { email: email.toLowerCase() }, include: { profile: true } });
            if(!userExists){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'Invalid credentials' };
            }

            const isMatch = await Bun.password.verify(password, userExists.hashedPassword);

            if(!isMatch){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'Invalid credentials' };
            }


            if(userExists.isActive === false || !userExists.isActive){
                set.status = HttpStatusEnum.HTTP_403_FORBIDDEN;
                return { message: `User access is revoked.\nReason: ${userExists.isComment ?? 'N/A'}` };
            }

            const sessions = await lucia.getUserSessions(userExists.id);
            if(sessions && sessions.length > consts.auth.maxSessions){
                console.log(`User has ${sessions.length} sessions`);
                const tempSessId = sessions[sessions.length-1].id;

                await lucia.invalidateSession(tempSessId);
            }
            

            const payload = {
                names: userExists.firstname + ' ' + userExists.lastname,
                email: userExists.email,
                phone: userExists.phone,
                roles: userExists.roles,
                emailVerified: userExists.emailVerified,
                createdAt: userExists.createdAt,
                profileId: userExists.profile?.id ?? null,
                profileIsActive: userExists.profile?.isActive ?? null,
                sessions: sessions.length
            }

            // Generate access token (JWT) using logged-in user's details
            const accessToken = await authJWT.sign({
                id: userExists.id,
                firstname: userExists.firstname,
                lastname: userExists.lastname,
                roles: userExists.roles,
                emailVerified: userExists.emailVerified,
                createdAt: userExists.createdAt,
                profileId: userExists.profile?.id ?? null
            });
           
            set.status = HttpStatusEnum.HTTP_200_OK;
            // Causes issues in Insomnia as it expects both to be available
            // if(authMethod === "Cookie"){
            //     const {id} = await authService.createLuciaSession(userExists.id, headers, rememberme);
            //     const sessionCookie = await lucia.createSessionCookie(id);
            //     sessionCookie.value = accessToken;
            //     set.headers["Set-Cookie"] = sessionCookie.serialize();
            // } else if(authMethod === "JWT") {
            //     set.headers["Authorization"] = `Bearer ${accessToken}`;
            // }

            const {id} = await authService.createLuciaSession(userExists.id, headers, rememberme);
            const sessionCookie = lucia.createSessionCookie(id);
            // sessionCookie.value = accessToken;
            set.headers["Authorization"] = `Bearer ${accessToken}`;
            set.headers["Set-Cookie"] = sessionCookie.serialize();
            return { data: payload, message: 'Successfully logged in' };
        } catch (e:any) {
            console.error(e);
            
            // check for unique constraint error in user table
            if (e.message === "AUTH_INVALID_KEY_ID" || e.message === "AUTH_INVALID_PASSWORD")
            {
                // user does not exist or invalid password
                set.status = HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE;
                return { message: "Invalid credentials" };
            }

            if(e instanceof Error){
                // General authentication error
                set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
                return { message: "Authentication error" };
            }

            console.error(e);
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: "An unknown login error occurred" };
        }
    }


    async signup({ set, request:{headers}, body: { firstname, lastname, email, phone, password, confirmPassword} } :any){
        
        // Create User 
        try {
            authService.validateCredentials(email, password, confirmPassword);

            const userExists = await db.user.findUnique({ where: { email: email } });

            if(userExists){
                set.status = HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE;
                return { message: 'That email address is taken' };
            }

            const autoUser = await authService.validateAutoEnrollment(email);

            const hashedPassword = await Bun.password.hash(password, {
                algorithm: 'argon2id',
                memoryCost: 5,
                timeCost: 5, // the number of iterations
            });

            const uid = generateId(18);
            const result: User|null = await db.user.create({ data: {
                id: uid,
                firstname,
                lastname,
                email: autoUser?.email ?? email,
                phone: (autoUser?.phone ?? phone) ?? null,
                emailVerified: false,
                isActive: true,
                roles: autoUser ? autoUser?.roles : [Role.GUEST],
                hashedPassword
            } });

            console.log("Created User ", result.firstname, autoUser ? '. Auto enrolled user: '+autoUser : 'No auto-enrol');

            // const verificationCode = await authService.generateEmailVerificationCode(result.id, email);
	        // await authService.sendEmailVerificationCode(email, verificationCode);

            if(autoUser?.supportLevel && autoUser?.supportLevel < 1){
                await db.autoEnrol.update({ where: { email: autoUser?.email}, data: { isActive: false, isComment: `Used for User Registration at ${new Date()}` } });
            }

            const session = await authService.createLuciaSession(result.id, headers);
            const sessionCookie = lucia.createSessionCookie(session.id);

            const sanitizedUser = authService.sanitizeUserObject(result);

            set.status = HttpStatusEnum.HTTP_201_CREATED;
            set.headers["Set-Cookie"] = sessionCookie.serialize();
            return { data: sanitizedUser, message: autoUser ? `${(autoUser.roles?.length ?? 'Nil')} roles Account successfully created, ${firstname} ${lastname}` : `Guest Account successfully created (${firstname} ${lastname})` };
        } catch (e) {
            console.error(e);

            if (e instanceof Error && e.name === "PrismaClientKnownRequestError") {
                set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
                return { message: "A data persistence problem occurred" };
            }
            
            // this part depends on the database you're using
            // check for unique constraint error in user table
            if (
                e instanceof Error
                && e.message === "AUTH_DUPLICATE_KEY_ID"
            ) {
                set.status = HttpStatusEnum.HTTP_409_CONFLICT;
                return { message: "that email address is already taken" };
            }
            set.status = 500
            return { message: "An unknown auth error occurred" };
        }
    }

    async logout({ set, request:{headers}, session, cookie: { lucia_session }, authJWT }: any){
        const isCookieValid = await lucia.validateSession(session.id);

        const token = headers?.get('Authorization')?.replace("Bearer ", "") ?? null;
        if(!token){
            set.status = HttpStatusEnum.HTTP_401_UNAUTHORIZED;
            return { message: 'No access token present' };
        }
        const isJWTValid = await authJWT.verify(token);

        if(!isCookieValid && !isJWTValid.userId){
            set.status = HttpStatusEnum.HTTP_405_METHOD_NOT_ALLOWED;
            return { message: 'You were not logged in' }
        }

        await authJWT.sign(null);

        const sessionCookie = lucia.createBlankSessionCookie();
        
        await lucia.invalidateSession(session.id);

        lucia_session.value = sessionCookie.value;
        await lucia_session.set(sessionCookie.attributes);

        // redirect back to login page
        set.status = HttpStatusEnum.HTTP_200_OK;
        // set.headers['HX-Redirect'] = '/';
        // set.redirect = '/auth/login';
        set.headers['Set-Cookie'] = sessionCookie.serialize();
        return { message: 'You successfully logged out' };
    }

    async getAllMySessions({set, user}:any){
        try {
            const sessions = await lucia.getUserSessions(user.id);

            if(!sessions){
                set.status = 404;
                return { message: 'No sessions found' }
            }

            // console.log(sessions);

            return { data: sessions.length, message: `Retrieved all ${sessions ? sessions.length+' of ' : ''}your sessions` }
        } catch (error) {
            console.error(error);
            
            return { message: 'Unable to fetch sessions', error: error }
        }
    }



    async getEmailVerificationToken({ set, request:{headers}, params: { code }, query: { email } }: any) {
        try {
            const user = await db.user.findUnique({ where: { email: email } });

            if (!user) {
                set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
                return { message: 'That email address is unavailable' };
            }

            const validCode = await authService.verifyVerificationCode(user, code);
            if (!validCode) {
                set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
                return { message: 'Verification not successful' }
            }

            await lucia.invalidateUserSessions(user.id);
            await db.user.update({ where: { id: user.id }, data: { emailVerified: true }})

            const session = await authService.createLuciaSession(user.id, headers);
            const sessionCookie = lucia.createSessionCookie(session.id);

            set.status = HttpStatusEnum.HTTP_302_FOUND;
            // set.header = { "Location": "/" };
            set.headers["Set-Cookie"] = sessionCookie.serialize();
            return { message: 'Your email has been verified ✅' };
        } catch(e) {
            console.error(e);
            
            set.status = 400;
            return "Unable to verify email account";
        }
    }

    async postEmailVerification({ set, user }:any) {
    
        if (!user) {
            set.status = HttpStatusEnum.HTTP_401_UNAUTHORIZED;
            set.headers['redirect'] = '/auth/login'
            return { message: 'You are not signed in' }
        }

        try {
            const verificationCode = await authService.generateEmailVerificationCode(user.id, user.email);
            await authService.sendEmailVerificationCode(user.email, verificationCode);
            
            set.status = 200;
            return { message: `Verification code sent to ${user.email}` }
        } catch (error) {
            console.error(error);

            set.status = 500;
            return { message: 'Unable to send verification code' }
        }
    }



    async postForgotPassword({ set, body:{ email } }:any){
        try {
            const user = await db.user.findUnique({ where:{ email: email }, select: { id: true } });

            if(!user){
                set.status = 404;
                return { message: 'An account with that email does not exist' }
            }

            const verificationToken = await authService.createPasswordResetToken(user.id);
            const verificationLink =  `${url}/auth/reset-password/${verificationToken}`;

            authService.sendPasswordResetToken(email, verificationLink);

            set.status = 200;
            return { message: `A password reset link has been sent to your email.\n Expires in 30 minutes` };
        } catch (e) {
            
        }
    }



    async getResetPassToken({ set, request:{headers}, params:{token} }:any) {
        set.status = 200;
        return { message: 'This route should take you to the app\'s page for password resetting' }
        
        // check your framework's API
        // const verificationToken = token;

        // const tokenHash = encodeHex(await sha256(new TextEncoder().encode(verificationToken)));
        // const _token = await db.passwordResetToken.findUnique({ where: { tokenHash: tokenHash } });
        // if (_token) {
        //     await db.passwordResetToken.delete({ where: { tokenHash: tokenHash } });
        // }

        // if (!_token || !isWithinExpirationDate(_token.expiresAt)) {
        //     set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
        //     return { message: 'Token has expired. Try again' }
        // }

        // await lucia.invalidateUserSessions(_token!.userId);
        // const hashedPassword = await Bun.password.hash(password);
        // await db.user.update({ where: { id: _token!.userId }, data:{ 
        //     hashedPassword: hashedPassword
        // } });

        // const session = await authService.createLuciaSession(_token!.userId, headers);
        // const sessionCookie = lucia.createSessionCookie(session.id);

        // set.status = HttpStatusEnum.HTTP_302_FOUND;
        // set.headers["Set-Cookie"] = sessionCookie.serialize();
        // set.headers["Referrer-Policy"] = "no-referrer";
        // return { message: 'Password successfully reset!' }
    }

    async postResetPass({ set, user }:any){
            // let em: string = email ? email : user.email;
            // console.log(user, session);
            
        
            // const u = await db.user.findUnique({ where: { email: user.email } });
            if (!user || !user.emailVerified) {
                set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;

                return { message: `Invalid account. ${!user?.emailVerified ? 'Is your email verified?' : 'No User detected'}` };
            }
        
            const verificationToken = await authService.createPasswordResetToken(user.id);
            const verificationLink =  `${url}/auth/reset-password/${verificationToken}`; // TYhis should be a link to the app's password reset page!
        
            await authService.sendPasswordResetToken(user.email, verificationLink);

            set.status = HttpStatusEnum.HTTP_200_OK;
            set.headers["Referrer-Policy"] = "no-referrer"; // might need to axe this
            return { message: `Password reset link sent to ${user.email}` };
    }

    async postResetPassToken({ set, request:{headers}, body:{password, confirmPassword}, params:{token} }:any){

        // if (typeof password !== "string" || password.length < 8) {
        //     set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
        //     return { message: 'Unacceptable password' };
        // }
        authService.validateCredentials('info@simmons.studio', password, confirmPassword)

        const verificationToken = token;

        const tokenHash = encodeHex(await sha256(new TextEncoder().encode(verificationToken)));
        const _token = await db.passwordResetToken.findUnique({ where: { tokenHash: tokenHash } });
        if (_token) {
            await db.passwordResetToken.delete({ where: { tokenHash: tokenHash } });
        }

        if (!_token || !isWithinExpirationDate(_token.expiresAt)) {
            set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
            return { message: 'Token has expired. Try again' }
        }

        
        
        const hashedPassword = await Bun.password.hash(password);
        await db.user.update({ where: { id: _token!.userId }, data:{ 
            hashedPassword: hashedPassword
        } });

        await lucia.invalidateUserSessions(_token!.userId);
        const session = await authService.createLuciaSession(_token!.userId, headers);
        const sessionCookie = lucia.createSessionCookie(session.id);

        set.status = HttpStatusEnum.HTTP_200_OK;
        set.headers["Set-Cookie"] = sessionCookie.serialize();
        set.headers["Referrer-Policy"] = "no-referrer";
        return { message: 'Your password was successfully reset!' }
    }
    

    
    async getChangePassword({ set, user, body: {oldPassword, newPassword, confirmPassword} }:any){
        try {
            // find user by Key, and validate password
            const userWithPass = await db.user.findUnique({ where: { email: user.email.toLowerCase() }, select: { hashedPassword: true } });
            if(!userWithPass){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'Invalid credentials' };
            }

            const isMatch = await Bun.password.verify(oldPassword, userWithPass.hashedPassword);
            
            if(!isMatch){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'Your passwords do not match' };
            }

            authService.validateCredentials(user.email, newPassword, confirmPassword);

            const newHashedPassword = await Bun.password.hash(newPassword, {
                algorithm: 'argon2id',
                memoryCost: 5,
                timeCost: 5 // the number of iterations
            });

            await db.user.update({ where:{ id: user.id }, data:{ hashedPassword: newHashedPassword } });

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { message: 'Your password was successfully changed' }
        } catch (e) {
            console.error(e);
            
            set.status = 500;
            return { message: 'Unable to change password'}
        }
    }


    /* OAuth2 */

    // Google
    async getGoogle({set, oauth2, cookie:{google_state, google_code_verifier}}:any) {
        const url = await oauth2.createURL("Google");
        url.searchParams.set("access_type", "offline");

        set.redirect = url.href;
        return { message: `Connecting to ${OAuth2Providers.Google}` };

        // Previous OAuth2 implementation by Lucia
        // const state = generateState();
        // const codeVerifier = generateCodeVerifier();
        // const url:URL = await google.createAuthorizationURL(state, codeVerifier);

        
        // google_state.value = state;
        // google_state.set({
        //     httpOnly: true,
        //     secure: Bun.env.NODE_ENV === "production",
        //     maxAge: 1000 * 60 * 15, // 15 minutes
        //     path: "/",
        //     sameSite: "lax"
        // });
        // google_code_verifier.value = codeVerifier,
        // google_code_verifier.set({
        //     httpOnly: true,
        //     secure: Bun.env.NODE_ENV === "production",
        //     maxAge: 1000 * 60 * 15, // 15 minutes
        //     path: "/"
        // }),
        // set.status = HttpStatusEnum.HTTP_302_FOUND;
        // set.redirect = url.toString();
        // // set.headers = headrs;
        // return;
    }
    async getGoogleCallback({set, oauth2, query, request:{ headers }, cookie:{google_state, google_code_verifier, lucia_session}}:any) {
        console.debug("Headers: ",headers)

        const url:URL = await oauth2.createURL(OAuth2Providers.Google);
        console.debug("Created URL: ",url);

        const token = await oauth2.authorize(OAuth2Providers.Google);
        console.debug("Google token: ",token);

        // await oauth2.redirect(OAuth2Providers.Google, "/");
        // send request to API with token


        // Previous OAuth2 implementation by Lucia
        // const code = query.code?.toString() ?? null;
        // const codeVerifier = google_code_verifier.value;
        // const state = query.state?.toString() ?? null;
        // const stateCookie = google_state.value;
        // if (!code || !state || !stateCookie || state !== stateCookie) {
        //     console.log(code, state, stateCookie);
        //     set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
        //     return;
        // }


        // try {
        //     const tokens = await google.validateAuthorizationCode(code, codeVerifier);
        //     const googleUserResponse = await fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
        //         headers: {
        //             Authorization: `Bearer ${tokens.accessToken}`
        //         }
        //     });
        //     const googleUserResult = await googleUserResponse.json();
        //     const existingUser = await db.user.findUnique({
        //         where: { google_id: googleUserResult.id}
        //     });

        //     if (existingUser) {
        //         const session = await authService.createLuciaSession(existingUser.id, headers);
        //         const sessionCookie = lucia.createSessionCookie(session.id);
        //         lucia_session.value = sessionCookie.value;
        //         lucia_session.set(sessionCookie.attributes);

        //         set.status = HttpStatusEnum.HTTP_302_FOUND;
        //         set.headers['Set-Cookie'] = sessionCookie.serialize();
        //         set.redirect = '/';

        //         return;
        //     }
    
        //     const userId = generateId(15);
        //     await db.user.create({ data: {
        //         id: userId,
        //         google_id: googleUserResult.id,
        //         firstname: googleUserResult.firstname,
        //         lastname: googleUserResult.lastname,
        //         email: googleUserResult.email,
        //         hashedPassword: googleUserResult.hashedPassword,
        //         isActive: true,
        //     } });
        //     // , username: googleUserResult.login

        //     const session = await authService.createLuciaSession(userId, request.headers);
        //     const sessionCookie = lucia.createSessionCookie(session.id).serialize();

        //     set.headers["Set-Cookie"] = sessionCookie;
        //     return { message: 'Successfully created Google User' };
        // } catch (e) {
        //     console.error(e);
            
        //     if (e instanceof OAuth2RequestError && e.message === "bad_verification_code") {
        //         // invalid code
        //         set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
        //         return { meesage: 'Verification code is not 💯' };
        //     }
        //     set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
        //     return { message: 'An error occurred creating that Google account' };
        // }
    }
}

const authService = new AuthService();
export default new AuthController(authService);