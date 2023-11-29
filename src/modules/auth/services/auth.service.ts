import { LuciaError } from 'lucia';
import { auth } from '~config/lucia';
import { db } from '~config/prisma';
import { comparePassword } from '../utils/bcrypt';
import { validateEmail, validatePassword } from '../utils/validations';

export default class AuthService{
    public static rawlogin = async (ctx: any) => {
            
        console.log('[Auth Service]');
        
        const { body: {email, password}, set, jwt, setCookie } = ctx;
            
            // verify email/username
            const user = await db.user.findFirst({
              where: {
                OR: [
                  {
                    email,
                  }
                ],
              },
              select: {
                id: true,
                hash: true,
                salt: true,
              },
            });
    
            if (!user) {
              set.status = 400;
              return {
                success: false,
                data: null,
                message: "Invalid credentials",
              };
            }
    
            // verify password
            const match = await comparePassword(password, user.salt, user.hash);
            if (!match) {
              set.status = 400;
              return {
                success: false,
                data: null,
                message: "Invalid credentials",
              };
            }
    
            // generate access 
            const accessToken = await jwt.sign({
              userId: user.id,
            });
    
            setCookie("access_token", accessToken, {
              maxAge: 15 * 60, // 15 minutes
              path: "/",
            });
    
    
            return {
              success: true,
              data: null,
              message: "Account login successfully",
            };
    }

    public static login = async (ctx: any) => {
            
        console.log('[Auth Service]');
        
        const { body: {email, password}, request, set, jwt, setCookie } = ctx;
            
        // basic check
        if (
            typeof email !== "string" ||
            email.length < 1 || email.length > 31
        ) {
            set.status = 400;
            return "Invalid email";
        }
        if (
            typeof password !== "string" ||
            password.length < 1 ||
            password.length > 255
        ) {
            set.status = 400;
            return "Invalid password";
        }

        try {
            // find user by key
            // and validate password
            const key = await auth.useKey("email", email.toLowerCase(), password);
            const session = await auth.createSession({
                userId: key.userId,
                attributes: {}
            });
            const authRequest = auth.handleRequest(request);
            authRequest.setSession(session);
            // redirect to profile page
            set.status = 302;
            // set.header("Location", "/").end();
        } catch (e) {
            // check for unique constraint error in user table
            if (
                e instanceof LuciaError &&
                (e.message === "AUTH_INVALID_KEY_ID" ||
                    e.message === "AUTH_INVALID_PASSWORD")
            ) {
                // user does not exist
                // or invalid password
                set.status = 400;
                return "Incorrect username or password";
            }
    
            set.status = 500;
            return "An unknown error occurred";
        }
    }


    static signup = async (ctx:any) => {
        const { body: { username,email,password }, request, set } = ctx;
        // basic check
        if (!validateEmail(email)) {
            set.status = 401
            return "Invalid email";
        }
        if (!validatePassword(password)) {
            set.status = 401;
            return "Invalid password";
        }
        try {
            const user = await auth.createUser({
                key:{
                    providerId: "email",
                    providerUserId: email.toLowerCase(),
                    password
                },
                attributes:{
                    username: username,
                    email: email.toLowerCase(),
                    email_verified: false,
                    salt: '',
                    hash: '',
                }
            });
            console.log("user ",user);
            
            const session = await auth.createSession({
                userId: user.userId,
                attributes: {}
            });
            const authRequest = auth.handleRequest(request);
            authRequest.setSession(session);
            // redirect to profile page
            set.status = 302;
            set.header("Location", "/");
        } catch (e) {
            // this part depends on the database you're using
            // check for unique constraint error in user table
            if (
                e instanceof LuciaError &&
                (e.message === "AUTH_INVALID_KEY_ID" ||
                    e.message === "AUTH_INVALID_PASSWORD")
            ) {
                // user does not exist or invalid password
                set.status = 400;
                return "Incorrect credentials";
            }
            if (
                e instanceof LuciaError
                && e.message === 'AUTH_DUPLICATE_KEY_ID'
            ) {
                set.status = 402;
                return "Username already taken";
            }

            set.status = 500;
            console.warn(e);
            
            return "An unknown auth error occurred"
        }
    }

    static logout = async (ctx: any) => {
        const {request, set} = ctx;

        const authRequest = auth.handleRequest(request);
        const session = await authRequest.validate(); // or `authRequest.validateBearerToken()`
        if (!session) {
            set.send = 401;
            return 'No Session';
        }
        await auth.invalidateSession(session.sessionId);

        authRequest.setSession(null); // for session cookie

        // redirect back to login page
        set.status = 302;
        // setHeader("Location", "/login").end()
        return 'log out...';
    }
}