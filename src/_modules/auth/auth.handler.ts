
import Elysia, { t } from "elysia";
import { AuthController, AuthService } from ".";
import { LoginUserDTO, RegisterUserDTO, changePasswordBody } from "./auth.models";
import { checkAuth } from "~middleware/authChecks";
import { oauth2 } from "elysia-oauth2";
import { swaggerDetails } from "~utils/response_helper";
import { UsersService } from "~modules/users";

const authService = AuthService.instance;
const userService = new UsersService();
const authController = new AuthController(userService, authService);

export const AuthHandler = new Elysia({
    prefix: '/auth',
    detail: { description: 'Authentication endpoints', tags: ['Auth'] }
})


    /* GET */


    .get('/', authController.root, {
        detail: swaggerDetails('/','Endpoint does not perform any action'),
    })

    .get('/login', authController.loginForm, {
        detail: swaggerDetails('Sign In [GET]', 'Advises Developer to use POST method'),
    })

    .get('/register', authController.signupForm, {
        detail: swaggerDetails('Create Account [GET]', 'Advises Developer to use POST method'),
    })

    .get('/login/google', authController.getGoogle, {
        response:{
            302: t.Object({ message: t.String({ default: 'Connecting to OAuth2Provider'}) }),
            500: t.Object({ message: t.String({ default: 'Unable to process OAuth login'}) })
        },
        detail: swaggerDetails('Sign In | Google', 'Logs you in to your Google Account'),
    })

    .get('/login/google/callback', authController.getGoogleCallback, {
        detail: swaggerDetails('Callback | Google', 'Endpoint for successful Google login'),
    })

    .get('/login/github', authController.getGithub, {
        response:{
            302: t.Object({ message: t.String({ default: 'Connecting to OAuth2Provider'}) }),
            500: t.Object({ message: t.String({ default: 'Unable to process OAuth login'}) })
        },
        detail: swaggerDetails('Sign In | Github', 'Logs you in to your Github Account'),
    })

    .get('/login/github/callback', authController.getGithubCallback, {
        query: t.Object({ code: t.String(), state: t.String() }),
        response: {
            302: t.Object({ message: t.String({default: 'Logged in using Github'}), data: t.Object({}) }),
            400: t.Object({ message: t.String({default: 'Invalid callback state'}) }),
            403: t.Object({ message: t.String({default: 'No public email available'}) }),
            500: t.Object({ message: t.String({default: 'Unable to validate OAuth callback'}) })
        },
        detail: swaggerDetails('Callback | Github', 'Endpoint for successful Github login'),
    })

    .get('/reset-password/:token', authController.getResetPassToken, {
        detail: swaggerDetails('Reset Password Token', 'Gets a reset password token'),
        params: t.Object({ token: t.String() }),
        // body: t.Object({ password: t.String() })
    })

    .get('/email-verification/:code', authController.getEmailVerificationToken, {
        detail: swaggerDetails('Email Verification Token', 'Gets an email verification token'),
        params: t.Object({ code: t.String() }),
        query: t.Object({ email: t.String({ format: "email", default: "abc@email.com", error: "A valid email address is required"}) }),
    })

    .get('/sessions', authController.getAllMySessions, {
        detail: swaggerDetails('Get All User Sessions', 'Fetches all sessions for current User'),
        beforeHandle: [checkAuth]
    })

    .get('/health', ()=>"Auth OK")


    /* POST */


    .post('/login', authController.login, {
        body: LoginUserDTO,
        response: {
            200: t.Object({ data: t.Any(), message: t.String({ default: 'Successfully logged in' }) }),
            400: t.Object({ message: t.String({ default: 'Authentication Error' }) }),
            403: t.Object({ message: t.String({ default: 'User access is revoked.\nReason: ...' }) }),
            404: t.Object({ message: t.String({ default: 'Invalid credentials' }) }),
            406: t.Object({ message: t.String({ default: 'Invalid credentials' }) }),
            500: t.Object({ message: t.String({ default: 'An unknown login error occurred' }) }),
        },
        detail: swaggerDetails('Sign in', 'Signs in User with previously registered account'),
    })

    .post('/register', authController.signup, {
        body: RegisterUserDTO,
        response: {
            201: t.Object({ data: t.Any(), message: t.String({ default: 'Guest Account successfully created (fullname)' }), note: t.String() }),
            400: t.Object({ message: t.String({ default: 'A data persistence problem occurred' }) }),
            406: t.Object({ message: t.String({ default: 'That email address is taken' }) }),
            409: t.Object({ message: t.String({ default: 'That email address is already taken' }) }),
            500: t.Object({ message: t.String({ default: 'An unknown auth error occurred' }) })
        },
        
        detail: swaggerDetails('Register New User','Creates a new User Account'),
    })

    .post('/logout', authController.logout, {
        // beforeHandle: checkAuth,
        response: {
            200: t.Union([
                t.Object({ message: t.String({ default: 'Successfully logged out'}) }),
                t.Undefined()
            ]),
            400: t.Object({ message: t.String({ default: 'No session or token present' }) }),
            401: t.Object({ message: t.String({ default: 'Invalid or expired token' }) }),
            500: t.Object({ message: t.String({ default: 'Unable to log user out' }) })
        },
        detail: swaggerDetails('Sign Out','Invalidates User\'s current session'),
    })

    .post('/email-verification', authController.postEmailVerification, {
        response: {
            200: t.Object({ message: t.String({ default: 'Verification code sent to user email'}) }),
            500: t.Object({ message: t.String({ default: 'Unable to send verification code'}) }),
        },
        detail: swaggerDetails('Send Email Verification Code','Sends a verification code to provided email address'),
    })

    .post('/forgot-password', authController.postForgotPassword, {
        body: t.Object({ email: t.String({ format: 'email', default:'abc@email.com' }) }),
        detail: swaggerDetails('Forgot Password','Sends password reset link to provided email if it exists'),
    })

    .post('/reset-password', authController.postResetPass, {
        detail: swaggerDetails('Reset Password', 'Sends password reset link to current User\'s email if verified'),
    })

    .post('/reset-password/:token', authController.postResetPassToken, {
        params: t.Object({ token: t.String() }),
        body: t.Object({ password: t.String(), confirmPassword: t.String() }),
        detail: swaggerDetails('Reset Password Token','Creates a new User Account'),
    })

    // .post('/resend-verification', authController.postEmailVerification, {
    //     response: {
    //         200: t.Object({ message: t.String({ default: 'Verification code sent to user email'}) }),
    //         500: t.Object({ message: t.String({ default: 'Unable to send verification code'}) }),
    //     }
    // })

    .post('/change-password', authController.getChangePassword, {
        beforeHandle: checkAuth,
        body: changePasswordBody,
        response: {
            200: t.Union([
                t.Object({ message: t.String({ default: 'Your password was successfully changed' }) }),
                t.Undefined()
            ]),
            400: t.Object({ message: t.String({ default: 'You must be signed in' })}),
            404: t.Object({ message: t.String({ default: 'Your passwords do not match' })}),
            500: t.Object({ message: t.String({ default: 'Unable to change password' })})
        },
        detail: swaggerDetails('Change Password','Creates new password by entering current password'),
    })
