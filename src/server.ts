import { Elysia } from "elysia";

// Route Handlers
import { RootHandler } from "~modules/root/index";
import { AuthHandler } from "~modules/auth/index";
import { UsersHandler } from "~modules/users/index";
import { FilesHandler } from "~modules/files";
import { WalletsRouter } from "~modules/wallets";
import { MessageRouter } from "~modules/messages";
import { CouponsRouter } from "~modules/coupons";
import { initializeEventListeners } from "./_queues/events";
import { NotificationRouter } from "~modules/notifications";
import consts from "~config/consts";


// ROUTES
export const v1 = new Elysia({
  prefix: `/v${consts.api.version}`,
})

  // Initialize Event listeners (Redis Pub/Sub) (Disabled)
  // initializeEventListeners();
  

  // files
  .use(FilesHandler)

  // root
  .use(RootHandler)

  // users
  .use(UsersHandler)

  // auth
  .use(AuthHandler)

  // wallet
  .use(WalletsRouter)

  // coupons
  .use(CouponsRouter)
  
  // messaging
  .use(MessageRouter)

  // push notifications
  .use(NotificationRouter);

  console.debug("Loading Handlers... Done!");

