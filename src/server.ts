import { Elysia } from "elysia";

// Route Handlers
import { RootHandler } from "~modules/root/index";
import { AuthHandler } from "~modules/auth/index";
import { UsersHandler } from "~modules/users/index";
import { FilesHandler } from "~modules/files";
import { WalletsRouter } from "~modules/wallets";
import { MessageRouter } from "~modules/messages";
import { CouponsRouter } from "~modules/coupons";
import { initializeEventListeners } from "~events/events";
import { NotificationRouter } from "~modules/notifications";
import {constants} from "~config/constants";
import swagger from "@elysiajs/swagger";


// ROUTES
export const server_v1 = new Elysia({
  prefix: `/v${constants.api.version}`,
})

  // Initialize Event listeners (Redis Pub/Sub) (Disabled)
  initializeEventListeners();

  // files
  server_v1.use(FilesHandler)

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
  .use(NotificationRouter)
  
  // Swagger
  .use(swagger({ autoDarkMode: true,
    documentation: {
      info: {
          title: `${constants.server.name}`,
          version: `${constants.server.version}`,
          description: `Server API for ${constants.server.name}`,
          contact: {
            name: constants.server.author,
            email: constants.server.email
          }
      }
    },
    swaggerOptions: {
      syntaxHighlight: { theme: "monokai" }
    }
  }));

  console.debug("Loading V1 Server... Done!");

