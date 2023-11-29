import { LuciaError } from "lucia";
import { auth } from "~config/lucia";
import { db } from "~config/prisma";
import { hashPassword, md5hash } from "~modules/auth/utils/bcrypt";
import AuthService from "../services/auth.service";

class AuthController {

    // Root Route
    static root = () => {
        return 'Auth Controller works!'
    }

    static login = AuthService.login

    static fn1 = async (ctx:any) => {
      const { body: { email, password}, request, set } = ctx;
        try {
          console.log(email, ", ",password);
          
            // find user by key and validate password
            const key = await auth.useKey("email", email.toLowerCase(), password);
            console.log('starting session...');
            const session = await auth.createSession({
                userId: key.userId,
                attributes: {}
            });
            const authRequest = auth.handleRequest(request);
            authRequest.setSession(session);
            // redirect to profile page
            set.status = 302;
            // setHeader("Location", "/").end();
            return 'redirect...'
        } catch (e) {
            // check for unique constraint error in user table
            if (
                e instanceof LuciaError &&
                (e.message === "AUTH_INVALID_KEY_ID" ||
                    e.message === "AUTH_INVALID_PASSWORD")
            ) {
                // user does not exist or invalid password
                set.status = 400
                return "Incorrect username or password";
            }
            set.status = 500
            console.log('ERROR: ',e);
            
            return "An unknown error occurred";
        }

        return 'login route!!!'
    }
 
    // static fn2 = async (ctx: any) => {
    //     const { body: { email, password, confirmPassword }, set } = ctx;

    //     if(password !== confirmPassword){
    //       set.status = 400
    //       return {
    //           success: false,
    //           data: null,
    //           message: "Passwords do not match"
    //       }
    //     }
    //     // validate duplicate email address
    //     const emailExists = await db.user.findUnique({
    //       where: {
    //         email,
    //       },
    //       select: {
    //         id: true,
    //       },
    //     });
    //     if (emailExists) {
    //       set.status = 400;
    //       return {
    //         success: false,
    //         data: null,
    //         message: "Email address already in use.",
    //       };
    //     }

    //     // validate duplicate username
    //   //   const usernameExists = await prisma.user.findUnique({
    //   //     where: {
    //   //       username,
    //   //     },
    //   //     select: {
    //   //       id: true,
    //   //     },
    //   //   });

    //   //   if (usernameExists) {
    //   //     set.status = 400;
    //   //     return {
    //   //       success: false,
    //   //       data: null,
    //   //       message: "Someone already taken this username.",
    //   //     };
    //   //   }

    //     // handle password
    //     const { hash, salt } = await hashPassword(password);
    //     const emailHash = md5hash(email);
    //     const profileImage = `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;

    //     const newUser = await db.user.create({
    //       data: {
    //         email,
    //         // hash,
    //         // salt,
    //         // names,
    //       },
    //     });

    //     return {
    //       success: true,
    //       message: "Account created",
    //       data: {
    //         user: newUser,
    //       },
    //     };
    // }

    static signup = AuthService.signup

    static logout = AuthService.logout
  }

export default AuthController