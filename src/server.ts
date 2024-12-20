import { Elysia } from "elysia";

// Route Handlers
import { RootHandler } from "~modules/root/index";
import { AuthHandler } from "~modules/auth/index";
import { UsersHandler } from "~modules/users/index";
import { FilesHandler } from "~modules/files";
import { WalletsRouter } from "~modules/wallets";
import { MessageRouter } from "~modules/messages";
import { CouponsRouter } from "~modules/coupons";


// ROUTES
export function registerControllers(app:Elysia){
  // console.info("Loading Handlers...");
  
  // root
  app.use(RootHandler);

  // auth
  app.use(AuthHandler);

  // users
  app.use(UsersHandler);

  // files
  app.use(FilesHandler);

  // wallet
  app.use(WalletsRouter);

  // coupons
  app.use(CouponsRouter);
  
  // messaging
  app.use(MessageRouter);

  // console.info("Loading Handlers... Done!");
}
