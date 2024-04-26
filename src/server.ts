import { Elysia } from "elysia";

// Route Handlers
import { rootHandler } from "~modules/root";
import { authHandler } from "~modules/auth";
import { usersHandler } from "~modules/users";


// ROUTES
export function registerControllers(app:Elysia){
  // root
  app.use(rootHandler);

  // auth
  app.use(authHandler);

  // users
  app.use(usersHandler);
}
