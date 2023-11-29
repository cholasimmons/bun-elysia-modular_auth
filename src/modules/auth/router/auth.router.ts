import { Elysia, t } from "elysia";
import { RegisterDTO } from "../models/register.model";
import AuthController from "../controllers/auth.controller";
import { LoginDTO } from "../models/login.model";
import { isAuthenticated } from "../middleware/auth";
import { elysia } from "lucia/middleware";
import { auth } from "~config/lucia";

function authRouter(app: Elysia){
  return app
    .get("/", AuthController.root)

    .get("/test", ()=>"[Auth Controller]")

    .get('/signup', (ctx)=> {
        // ctx.set = 
        return Bun.file("./src/public/welcome.html").text()
    })

    .post("/login", AuthController.login, { body: LoginDTO })

    .post('/signup', AuthController.signup, { body: RegisterDTO})

    .post('/logout', AuthController.logout)

    .use(isAuthenticated)
    // protected route
    .get("/me", ({ user }) => {
            return {
              success: true,
              message: "Fetch authenticated user details",
              data: {
                user,
              },
            };
    })
  }

export default authRouter;