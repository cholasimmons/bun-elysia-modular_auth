import { githubAuth, googleAuth, lucia } from "~config/lucia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { db } from "~config/prisma";
import { generateId, generateIdFromEntropySize } from "lucia";
import { encodeHex } from "oslo/encoding";
import { sha256 } from "oslo/crypto";
import { isWithinExpirationDate } from "oslo";
import { AuthService } from "./auth.service";
import { Role, User } from "@prisma/client";
import { constants, RedisEvents, RedisKeys } from "~config/constants";
import { GitHubUserResult, GoogleUserResult, OAuth2Providers } from "./auth.models";
import { generateCodeVerifier, generateState, OAuth2RequestError } from "arctic";
import { parseCookies, serializeCookie } from "oslo/cookie";
import { splitWords } from "~utils/utilities";
import { blacklistToken, redisMessagingService, redisSet } from "~config/redis";
import { UsersService } from "~modules/users";
import { AuthenticationError, ConflictError, NotFoundError } from "~exceptions/custom_errors";
import { PrismaUserWithProfile, SafeUser } from "~modules/users/users.model";

export class AuthController {
    url = `${Bun.env.NODE_ENV === 'production' ? 'https' : 'http'}://${Bun.env.HOST ?? '127.0.0.1'}:${Bun.env.PORT ?? 3000}${ constants.api.versionPrefix}${constants.api.version}`;

    constructor(
        private userService: UsersService,
        private authService: AuthService        
    ) { }

    root({ cookie }: any):string{
        // console.log('cookie: ',cookie);
        return 'Nothing to see here :)'
    }

    loginForm({ request:{ headers }}: any){
        const isBrowser = headers.get('accept').includes('text/html');

        return isBrowser ? Bun.file('public/login.html') : { message: 'Use POST instead'}
    }

    signupForm({ request:{ headers }}: any){
        const isBrowser = headers.get('accept').includes('text/html');

        return isBrowser ? Bun.file('public/register.html') : { message: 'Use POST instead'}
    }

    login = async ({ set, request:{headers}, body, jwt, authMethod, cookie:{auth_cookie}, session }: any) => {
        const {email, password, rememberme} = body;
        
        try {
            // Verification moved to middleware, and derived

            this.authService.validateCredentials(email.toLowerCase(), password)

            // find user by Key, and validate password
            let userExists:PrismaUserWithProfile|null = await db.user.findUnique({ where: { email: email.toLowerCase() }, include: { profile: true } });
            
            if(!userExists){
                throw new NotFoundError("Invalid credentials");
                // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                // return { message: 'Invalid User credentials' };
            }

            const isMatch = await Bun.password.verify(password, userExists.hashedPassword);

            if(!isMatch){
                throw new AuthenticationError("Invalid login credentials");
                // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                // return { message: 'Invalid credentials' };
            }


            if(userExists.isActive === false || !userExists.isActive){
                throw new AuthenticationError("User access is revoked", 403, userExists.isComment ?? "N/A");
                // set.status = HttpStatusEnum.HTTP_403_FORBIDDEN;
                // return { message: 'User access is revoked.', note: userExists.isComment ?? "N/A" };
            }

            const sessions = await lucia.getUserSessions(userExists.id);
            if(sessions && sessions.length > constants.auth.maxSessions){
                console.log(`User has ${sessions.length} sessions`);
                const tempSessId = sessions[sessions.length-1].id;

                await lucia.invalidateSession(tempSessId);
            }

            const safeUser: SafeUser = this.userService.sanitizeUserObject(userExists);
            const sanitizedUser = {
                firstname: userExists.firstname,
                lastname: userExists.lastname,
                email: userExists.email,
                username: userExists.email,
                phone: userExists.phone,
                roles: userExists.roles,
                emailVerified: userExists.emailVerified,
                createdAt: userExists.createdAt,
                updatedAt: userExists.updatedAt,
                profileId: userExists.profile?.id ?? null,
                profileIsActive: userExists.profile?.isActive ?? null,
                sessions: sessions.length
            }

            // Event: Publish event that a User successfully logged in
            redisMessagingService.publish(RedisEvents.USER, {
                action: RedisEvents.USER_LOGIN,
                user: safeUser
            });
            
            // RAW redis function
            await redisSet(RedisKeys.USER(userExists.id), safeUser, 5);

            const tokenOrCookie = await this.authService.createDynamicSession(authMethod, jwt, userExists, headers, rememberme);
            if(authMethod === 'JWT'){
                set.headers["Authorization"] = `Bearer ${tokenOrCookie}`;
            } else if (authMethod === 'Cookie'){
                set.headers["Set-Cookie"] = tokenOrCookie.serialize();
            }


            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: authMethod === 'Cookie' ? sanitizedUser : authMethod === 'JWT' ? {token: tokenOrCookie, user: sanitizedUser} : null, message: 'Successfully logged in' };
        } catch (e:any) {
            console.error(e);
            
            // check for unique constraint error in user table
            if (e.message === "AUTH_INVALID_KEY_ID" || e.message === "AUTH_INVALID_PASSWORD")
            {
                // user does not exist or invalid password
                set.status = HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE;
                return { message: "Invalid credentials" };
            }

            if(e.name === 'PrismaClientInitializationError'){

                set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
                return { message: 'Our system ran into an error', note: 'Database not initialized' };
            }

            console.error(e);
            throw e;
            // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            // return { message: "An unknown login error occurred" };
        }
    }


    signup = async({ set, body, request:{ headers } } :any) => {
        const { firstname, lastname, email, phone, password, confirmPassword} = body;
        
        // Create User 
        try {
            this.authService.validateCredentials(email, password, confirmPassword);

            const userExists = await db.user.findUnique({ where: { email: email } });

            if(userExists){
                set.status = HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE;
                return { message: 'That email address is taken' };
            }

            const autoUser = await this.authService.validateAutoEnrollment(email);

            const hashedPassword = await Bun.password.hash(password, {
                algorithm: 'argon2id',
                memoryCost: 5,
                timeCost: 5, // the number of iterations
            });

            const uid = generateId(16);
            const newUser: User|null = await db.user.create({ data: {
                id: uid,
                firstname,
                lastname,
                username: autoUser?.email ?? email, // usernameFromEmail(autoUser?.email ?? email),
                email: autoUser?.email ?? email,
                phone: (autoUser?.phone ?? phone) ?? null,
                emailVerified: false,
                isActive: true,
                roles: autoUser ? autoUser?.roles : [Role.GUEST],
                prefs: {"theme":"dark", "first_use":true},
                hashedPassword
            } }) as User;

            console.log("Created User ", newUser.firstname, autoUser ? '. Auto enrolled user: '+autoUser : 'No auto-enrol');

            // Moved to Event queue
            // if(Bun.env.NODE_ENV === 'production'){
            //     const verificationCode = await this.authService.generateEmailVerificationCode(newUser.id, email);
	        //     this.authService.sendEmailVerificationCode(email, verificationCode)
            //         .then(() => {
            //             console.debug(`Verification code sent to ${email}`);
            //         })
            //         .catch((e) => {
            //             console.debug(`Unable to send verification code to ${email} ${e}`);
            //         });
            // }

            if(autoUser?.supportLevel && autoUser?.supportLevel < 1){
                await db.autoEnrol.update({ where: { email: autoUser?.email}, data: { isActive: false, isComment: `Used for User Registration at ${new Date()}` } });
            }

            const session = await this.authService.createLuciaSession(newUser.id, headers);
            const sessionCookie = lucia.createSessionCookie(session.id);

            const safeUser: SafeUser = this.userService.sanitizeUserObject(newUser);

            // Event
            redisMessagingService.publish(RedisEvents.USER, {
                action: RedisEvents.USER_REGISTER,
                user: safeUser
            });

            set.status = HttpStatusEnum.HTTP_201_CREATED;
            return {
                data: safeUser,
                message: autoUser ? `${(autoUser.roles?.length ?? 'Nil')} roles Account successfully created, ${firstname} ${lastname}` : `Guest Account successfully created (${firstname} ${lastname})`,
                note: 'User account created' + autoUser ? ' via Auto-enrol' : '. No Auto-enrol'
            };

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
                throw new ConflictError("That email address is taken", HttpStatusEnum.HTTP_409_CONFLICT);
                // set.status = HttpStatusEnum.HTTP_409_CONFLICT;
                // return { message: "that email address is already taken" };
            }
            
            throw e;
        }
    }

    logout = async ({ set, request:{headers}, session, user, cookie, jwt, authMethod }: any) => {

        try {
            // Determine the authentication method
            const isCookieAuth = session?.id; // If session ID is present, assume cookie-based auth
            const token = headers?.get('Authorization')?.replace("Bearer ", "") ?? null;
            console.error(cookie);
            
    
            if (authMethod === 'Cookie') {
                // Handle cookie-based authentication
                if (!await lucia.validateSession(session.id)) {
                    set.status = HttpStatusEnum.HTTP_401_UNAUTHORIZED;
                    return { message: 'Invalid session' };
                }
    
                // Invalidate the session
                await lucia.invalidateSession(session.id);
    
                // Create a blank session cookie to clear the existing one
                const sessionCookie = lucia.createBlankSessionCookie();
                set.headers['Set-Cookie'] = sessionCookie.serialize();
                
            } else if (authMethod === 'JWT') {
                // Handle JWT-based authentication
                if (!await jwt.verify(token)) {
                    set.status = HttpStatusEnum.HTTP_401_UNAUTHORIZED;
                    return { message: 'Invalid or expired token' };
                }
    
                // Blacklist the token
                await blacklistToken(token, 60 * 60); // Adjust the expiry as needed
    
                // Optionally sign out the JWT token
                await jwt.sign(null);
    
                // No need to handle cookies for JWT auth
            } else {
                set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
                return { message: 'No session or token present' };
            }

            // Event
            redisMessagingService.publish(RedisEvents.USER_LOGOUT, null);
    
            // Set the response status
            set.status = HttpStatusEnum.HTTP_200_OK;
            return { message: 'Successfully logged out' };
            
        } catch (error) {
            console.error('Logout error:', error);
            
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: 'Unable to log user out' };
        }
        
    }

    getAllMySessions = async({set, user}:any) => {
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



    getEmailVerificationToken = async({ set, request:{headers}, params: { code }, query: { email } }: any) => {
        try {
            const user = await db.user.findUnique({ where: { email: email } });

            if (!user) {
                set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
                return { message: 'That email address is unavailable' };
            }

            const validCode = await this.authService.verifyVerificationCode(user, code);
            if (!validCode) {
                set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
                return { message: 'Verification not successful' }
            }

            await lucia.invalidateUserSessions(user.id);
            await db.user.update({ where: { id: user.id }, data: { emailVerified: true }})

            const session = await this.authService.createLuciaSession(user.id, headers, user.profileId);
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

    postEmailVerification = async({ set, user }:any) => {
    
        if (!user) {
            set.status = HttpStatusEnum.HTTP_401_UNAUTHORIZED;
            set.headers['redirect'] = '/auth/login'
            return { message: 'You are not signed in' }
        }

        try {
            const verificationCode = await this.authService.generateEmailVerificationCode(user.id, user.email);
            await this.authService.sendEmailVerificationCode(user.email, verificationCode);
            
            set.status = 200;
            return { message: `Verification code sent to ${user.email}` }
        } catch (error) {
            console.error(error);
            throw error;

            set.status = 500;
            return { message: 'Unable to send verification code' }
        }
    }



    postForgotPassword = async({ set, body:{ email } }:any) => {
        try {
            const user = await db.user.findUnique({ where:{ email: email }, select: { id: true } });

            if(!user){
                throw new NotFoundError("An account with that email does not exist");
                // set.status = 404;
                // return { message: 'An account with that email does not exist' }
            }

            const verificationToken = await this.authService.createPasswordResetToken(user.id);
            const verificationLink =  `${this.url}/auth/reset-password/${verificationToken}`;

            this.authService.sendPasswordResetToken(email, verificationLink);

            set.status = 200;
            return { message: `Password reset link sent to your email.\n Validity: 30 minutes` };
        } catch (e) {
            throw e
        }
    }



    getResetPassToken = async({ set, request:{headers}, params:{token} }:any) => {
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

        // const session = await this.authService.createLuciaSession(_token!.userId, headers);
        // const sessionCookie = lucia.createSessionCookie(session.id);

        // set.status = HttpStatusEnum.HTTP_302_FOUND;
        // set.headers["Set-Cookie"] = sessionCookie.serialize();
        // set.headers["Referrer-Policy"] = "no-referrer";
        // return { message: 'Password successfully reset!' }
    }

    postResetPass = async({ set, user }:any) => {
            // let em: string = email ? email : user.email;
            // console.log(user, session);
            
        
            // const u = await db.user.findUnique({ where: { email: user.email } });
            if (!user || !user.emailVerified) {
                set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;

                return { message: `Invalid account. ${!user?.emailVerified ? 'Is your email verified?' : 'No User detected'}` };
            }
        
            const verificationToken = await this.authService.createPasswordResetToken(user.id);
            const verificationLink =  `${this.url}/auth/reset-password/${verificationToken}`; // TYhis should be a link to the app's password reset page!
        
            await this.authService.sendPasswordResetToken(user.email, verificationLink);

            set.status = HttpStatusEnum.HTTP_200_OK;
            set.headers["Referrer-Policy"] = "no-referrer"; // might need to axe this
            return { message: `Password reset link sent to ${user.email}` };
    }

    postResetPassToken = async({ set, request:{headers}, body:{password, confirmPassword}, params:{token} }:any) => {

        // if (typeof password !== "string" || password.length < 8) {
        //     set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
        //     return { message: 'Unacceptable password' };
        // }
        this.authService.validateCredentials('info@simmons.studio', password, confirmPassword)

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
        const session = await this.authService.createLuciaSession(_token!.userId, headers);
        const sessionCookie = lucia.createSessionCookie(session.id);

        set.status = HttpStatusEnum.HTTP_200_OK;
        set.headers["Set-Cookie"] = sessionCookie.serialize();
        set.headers["Referrer-Policy"] = "no-referrer";
        return { message: 'Your password was successfully reset!' }
    }
    

    
    getChangePassword = async({ set, user, body: {oldPassword, newPassword, confirmPassword} }:any) => {
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

            this.authService.validateCredentials(user.email, newPassword, confirmPassword);

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
    async getGoogle({set}:any) {
        const state:string = generateState();
        const codeVerifier = generateCodeVerifier();
        const authUrl:URL = await googleAuth.createAuthorizationURL(state, codeVerifier, { scopes: ['profile', 'email']});

        set.status = HttpStatusEnum.HTTP_302_FOUND;
        set.redirect = authUrl.href.toString();
        set.headers["Set-Cookie"] = serializeCookie("google_oauth_state", state, {
            httpOnly: true,
            secure: Bun.env.NODE_ENV === "PRODUCTION", // set `Secure` flag in HTTPS
            maxAge: 60 * 10, // 10 minutes
            sameSite: 'lax',  // Prevent CSRF, but allow same-site requests
            domain: '127.0.0.1',
            path: '/'
        });
        set.headers["Set-Cookie"] = serializeCookie("google_oauth_code_verifier", state, {
            httpOnly: true,
            secure: Bun.env.NODE_ENV === "PRODUCTION", // set `Secure` flag in HTTPS
            maxAge: 60 * 10, // 10 minutes
            sameSite: 'lax',  // Prevent CSRF, but allow same-site requests
            domain: '127.0.0.1',
            path: '/'
        });
        return { data: null, message: `Connecting to ${OAuth2Providers.Google}` };
    }
    getGoogleCallback = async({set, request:{ headers, url }}:any) => {
        const cookies = parseCookies(headers.get("Cookie") ?? "");
	    const stateCookie = cookies.get("google_oauth_state") ?? null;
	    const codeVerifierCookie = cookies.get("google_oauth_code_verifier");
        const sessionCookie = cookies.get("session_id") ?? null;

        const authUrl = new URL(url);
	    const state = authUrl.searchParams.get("state");
	    const code = authUrl.searchParams.get("code");

        // verify searchParams
        if (!state || !stateCookie || !code) {
            set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
            return { message: 'Invalid OAuth request', error: 'searchParams missing' }
        }
        // verify state
        if (stateCookie !== state) {
            set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
            return { message: 'OAuth credentials do not match' }
        }

        try {
            // Exchange the authorization code for tokens
            const tokens = await googleAuth.validateAuthorizationCode(code, codeVerifierCookie!);
            
            // Fetch user details from GitHub
            const googleUserResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: {
                    Authorization: `Bearer ${tokens.accessToken}`
                }
            });

            if (!googleUserResponse.ok) {
                return { message: `No Google response: ${googleUserResponse.statusText}` };
            }

            const googleUserResult: GoogleUserResult = await googleUserResponse.json();
    
            // Check if the user already exists
            const existingUser = await db.oAuth_Account.findUnique({ where: { providerId: OAuth2Providers.Google, providerUserId: googleUserResult.sub } });

            if (existingUser && existingUser.userId) {                
                const session:any = await this.authService.createLuciaSession(existingUser.userId, headers, undefined, true);
                
                const sessionCookie = lucia.createSessionCookie(session.id);
                set.status = HttpStatusEnum.HTTP_302_FOUND;
                set.headers["Set-Cookie"] = sessionCookie.serialize();
                set.redirect = `${constants.api.versionPrefix}${constants.api.version}/`;
                return { message: `Logged back in using ${OAuth2Providers.Google}` }
            }

            // A new account has to be created, we need additional data such as names & email

            // If public profile on Github has no email address
            if(!googleUserResult.email){
                set.status = HttpStatusEnum.HTTP_403_FORBIDDEN;
                return { message: 'No public email available', error:'Your Google account has no public email' }
            }
    
            const userId = generateIdFromEntropySize(10); // 16 characters long
            await db.$connect();
            await db.oAuth_Account.create({
                data:{
                    providerId: OAuth2Providers.Google,
                    providerUserId: String(googleUserResult.sub),
                    user: {
                        create: {
                            id: userId,
                            username: googleUserResult.email,
                            firstname: splitWords(googleUserResult.name ?? '', 1),
                            lastname: splitWords(googleUserResult.name ?? '', 2),
                            email: googleUserResult.email,
                            emailVerified: true,
                            roles: [Role.GUEST],
                            hashedPassword: '',
                            createdAt: googleUserResult.created_at,
                            updatedAt: googleUserResult.updated_at
                        }
                    } 
                }
            })
            await db.$disconnect();
    
            const session = await this.authService.createLuciaSession(userId, headers, undefined, true);
            const sessionCookie = lucia.createSessionCookie(session.id);
            set.status = HttpStatusEnum.HTTP_302_FOUND;
            set.headers["Set-Cookie"] = sessionCookie.serialize();
            set.redirect = "/";
            return { message: 'Logged in as new Github User', data: googleUserResult }
        } catch(e) {
            console.log(e);
            if (e instanceof OAuth2RequestError) {
                // bad verification code, invalid credentials, etc
                set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
                return { message: 'Invalid OAuth code', error: e}
            }
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: 'Unable to validate OAuth callback'}
        }
    }

    // Github
    
    getGithub = async ({set}:any) => {
        try {
            const state:string = generateState();
            const authUrl:URL = await githubAuth.createAuthorizationURL(state);
            // console.debug("auth: ",authUrl);
            // console.debug("href: ",authUrl.href);
            

            set.status = HttpStatusEnum.HTTP_302_FOUND;
            set.redirect = authUrl.href.toString();
            set.headers["Set-Cookie"] = serializeCookie("github_oauth_state", state, {
                httpOnly: true,
				secure: Bun.env.NODE_ENV === "PRODUCTION", // set `Secure` flag in HTTPS
				maxAge: 60 * 10, // 10 minutes
                sameSite: 'lax',  // Prevent CSRF, but allow same-site requests
                domain: '127.0.0.1',
				path: '/'
            });
            return { data: null, message: `Connecting to ${OAuth2Providers.Github}` };
        } catch (error) {
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: "Unable to process OAuth login" };
        }
    }
    getGithubCallback = async({set, request:{ headers, url }}:any) => {
        const cookies = parseCookies(headers.get("Cookie") ?? "");
	    const stateCookie = cookies.get("github_oauth_state") ?? null;
        const sessionCookie = cookies.get("session_id") ?? null;

        const authUrl = new URL(url);
	    const state = authUrl.searchParams.get("state");
	    const code = authUrl.searchParams.get("code");

        // Verify the session cookie
        if (sessionCookie) {
            try {
                const session = await lucia.validateSession(sessionCookie);
                if (session && session.user?.id) {
                    set.status = HttpStatusEnum.HTTP_302_FOUND;
                    set.redirect = "/";
                    return { message: 'Already logged in' };
                }
            } catch (e) {
                console.error("Invalid session cookie. Not logged in?", e);
            }
        }

        // Debug
        // console.debug("cookies: ",cookies);
        // console.debug("searchParams: ",authUrl.searchParams);
        // console.debug("state: ",state);
        // console.debug("code: ",code);

        // verify searchParams
        if (!state || !stateCookie || !code) {
            set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
            return { message: 'Invalid OAuth request', error: 'searchParams missing' }
        }
        // verify state
        if (stateCookie !== state) {
            set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
            return { message: 'OAuth credentials do not match' }
        }

        try {
            // Exchange the authorization code for tokens
            const tokens = await githubAuth.validateAuthorizationCode(code);
            
            // Fetch user details from GitHub
            const githubUserResponse = await fetch("https://api.github.com/user", {
                headers: {
                    Authorization: `Bearer ${tokens.accessToken}`
                }
            });

            if (!githubUserResponse.ok) {
                return { message: `No GitHub response: ${githubUserResponse.statusText}` };
            }

            const githubUserResult: GitHubUserResult = await githubUserResponse.json();
            // console.debug("Github User: ",githubUserResult);
            
    
            // Check if the user already exists
            const existingUser = await db.oAuth_Account.findUnique({ where: { providerId: OAuth2Providers.Github, providerUserId: String(githubUserResult.id) } });            

            if (existingUser && existingUser.userId) {                
                const session:any = await this.authService.createLuciaSession(existingUser.userId, headers, undefined, true);
                
                const sessionCookie = lucia.createSessionCookie(session.id);
                set.status = HttpStatusEnum.HTTP_302_FOUND;
                set.headers["Set-Cookie"] = sessionCookie.serialize();
                set.redirect = `${constants.api.versionPrefix}${constants.api.version}/`;
                return { message: 'Logged back in using Github' }
            }

            // A new account has to be created, we need additional data such as names & email

            // If public profile on Github has no email address
            if(!githubUserResult.email){
                set.status = HttpStatusEnum.HTTP_403_FORBIDDEN;
                return { message: 'No public email available', error:'Your Github account has no public email' }
            }
    
            const userId = generateIdFromEntropySize(10); // 16 characters long
            await db.$connect();
            await db.oAuth_Account.create({
                data:{
                    providerId: OAuth2Providers.Github,
                    providerUserId: String(githubUserResult.id),
                    user: {
                        create: {
                            id: userId,
                            username: githubUserResult.login,
                            firstname: splitWords(githubUserResult.name ?? '', 1),
                            lastname: splitWords(githubUserResult.name ?? '', 2),
                            email: githubUserResult.email,
                            emailVerified: true,
                            roles: [Role.GUEST],
                            hashedPassword: '',
                            createdAt: githubUserResult.created_at,
                            updatedAt: githubUserResult.updated_at
                        }
                    } 
                }
            })
            await db.$disconnect();
    
            const session = await this.authService.createLuciaSession(userId, headers, undefined, true);
            const sessionCookie = lucia.createSessionCookie(session.id);
            set.status = HttpStatusEnum.HTTP_302_FOUND;
            set.headers["Set-Cookie"] = sessionCookie.serialize();
            set.redirect = "/";
            return { message: 'Logged in as new Github User', data: githubUserResult }

        } catch (e) {
            console.log(e);
            if (e instanceof OAuth2RequestError) {
                // bad verification code, invalid credentials, etc
                set.status = HttpStatusEnum.HTTP_400_BAD_REQUEST;
                return { message: 'Invalid OAuth code', error: e}
            }
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: 'Unable to validate OAuth callback'}
        }
    }
}