import { Elysia } from "elysia";

// Route Handlers
import { RootHandler } from "~modules/root/index";
import { AuthHandler } from "~modules/auth/index";
import { UsersHandler } from "~modules/users/index";


// ROUTES
export function registerControllers(app:Elysia){
  console.info("Loading Handlers...");
  
  // root
  app.use(RootHandler);

  // auth
  app.use(AuthHandler);

  // users
  app.use(UsersHandler);

  console.info("Loading Handlers... Done!");
}
