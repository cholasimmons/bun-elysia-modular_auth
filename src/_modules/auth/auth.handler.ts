
import Elysia, { t } from "elysia";
import { AuthController } from ".";
import { LoginUserDTO, RegisterUserDTO, changePasswordBody } from "./auth.models";
import { checkCookieAuth } from "~middleware/Auth";
import { lucia } from "~config/lucia";
import { db } from "~config/prisma";



const authHandler = new Elysia({
    prefix: '/auth',
    detail: { description: 'Authentication endpoints', tags: ['Auth'] }
})

    .get('/', AuthController.root, {
        // afterHandle: customResponse
    })

    .get('/login', ()=>'use POST not GET')

    .get('/login/google', AuthController.getGoogle)

    .get('/login/google/callback', AuthController.getGoogleCallback)

    .get('/reset-password/:token', AuthController.getResetPassToken, {
        params: t.Object({ token: t.String() }),
        // body: t.Object({ password: t.String() })
    })

    .get('/email-verification/:code', AuthController.getEmailVerificationToken, {
        params: t.Object({ code: t.String() }),
        query: t.Object({ email: t.String({ format: "email", default: "abc@email.com", error: "A valid email address is required"}) }),
    })

    .get('/sessions', AuthController.getAllMySessions, {
        beforeHandle: [checkCookieAuth]
    })


    /* POST */


    .post('/login', AuthController.login, {
        body: LoginUserDTO,
        response: {
            200: t.Object({ data: t.Any(), message: t.String({ default: 'Successfully logged in' }) }),
            400: t.Object({ message: t.String({ default: 'Authentication Error' }) }),
            403: t.Object({ message: t.String({ default: 'User access is revoked.\nReason: ...' }) }),
            404: t.Object({ message: t.String({ default: 'Invalid credentials' }) }),
            406: t.Object({ message: t.String({ default: 'Invalid credentials' }) }),
            500: t.Object({ message: t.String({ default: 'An unknown login error occurred' }) }),
        },
        // transform: [(ctx:any) => {ctx.store.user = 'email'}],
        // afterHandle: ({store})=>{ console.log(store) }
    })

    .post('/register', AuthController.signup, {
        body: RegisterUserDTO,
        response: {
            302: t.Object({ message: t.String({ default: 'Guest Account successfully created (fullname)' }) }),
            400: t.Object({ message: t.String({ default: 'A data persistence problem occurred' }) }),
            406: t.Object({ message: t.String({ default: 'That email address is taken' }) }),
            409: t.Object({ message: t.String({ default: 'That email address is already taken' }) }),
            500: t.Object({ message: t.String({ default: 'An unknown auth error occurred' }) })
        },
    })

    .post('/logout', AuthController.logout, {
        beforeHandle: checkCookieAuth,
        response: {
            200: t.Object({ message: t.Optional( t.String({ default: 'You successfully logged out'}) ) })
        }
    })

    .post('/email-verification', AuthController.postEmailVerification, {
        response: {
            200: t.Object({ message: t.String({ default: 'Verification code sent to user email'}) }),
            500: t.Object({ message: t.String({ default: 'Unable to send verification code'}) }),
        }
    }) // POST??? really?

    .post('/forgot-password', AuthController.postForgotPassword, {
        body: t.Object({ email: t.String({ format: 'email', default:'abc@email.com' }) })
    })

    .post('/reset-password', AuthController.postResetPass)

    .post('/reset-password/:token', AuthController.postResetPassToken, {
        params: t.Object({ token: t.String() }),
        body: t.Object({ password: t.String(), confirmPassword: t.String() })
    }) // POST? come'on...

    // .post('/resend-verification', AuthController.postEmailVerification, {
    //     response: {
    //         200: t.Object({ message: t.String({ default: 'Verification code sent to user email'}) }),
    //         500: t.Object({ message: t.String({ default: 'Unable to send verification code'}) }),
    //     }
    // })

    .post('/change-password', AuthController.getChangePassword, {
        body: changePasswordBody,
        response: {
            200: t.Object({ message: t.String({ default: 'Your password was successfully changed' })}),
            400: t.Object({ message: t.String({ default: 'You must be signed in' })}),
            404: t.Object({ message: t.String({ default: 'Your passwords do not match' })}),
            500: t.Object({ message: t.String({ default: 'Unable to change password' })})
        }
    })

    

export default authHandler;