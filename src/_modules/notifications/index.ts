import Elysia, { t } from "elysia";
import {
  checkAuth,
  checkForProfile,
  checkIsAdmin,
  checkIsStaff,
} from "~middleware/authChecks";
import { NotificationService } from "./notifications.service";
import {
  NotificationQueriesDTO,
  CreateNotificationDTO,
  NotificationResponseDTO,
} from "./notifications.model";
import { swaggerDetails } from "~utils/response_helper";
import { constants } from "~config/constants";
import { ElysiaWS } from "elysia/ws";

export const NotificationRouter = new Elysia({
  prefix: "/notifications",
  detail: { description: "Push Notification System", tags: ["Notifications"] },
  websocket: { idleTimeout: 25 },
})

  // .onBeforeHandle([checkAuth, checkForProfile])

  /* GET */
  .get("/", async () => {
    await NotificationService.manager.sendMessageToUser("6386", "We did it!!!");

    return { message: "Get route '/' working." };
  })

  // .ws('/connect', controller.handleWebSocketConnection)
  // .ws("/", {
  //   ping: (message: string) => message,
  //   pong: (message: string) => message,
  // })

  .ws("/ws", {
    // validate incoming message
    // body: t.Object({
    //     message: t.String()
    // }),
    // query: t.Object({
    //     id: t.String()
    // }),

    async open(ws) {
      try {
        const headers = ws.data.headers;

        const connectionId = headers["x-connection-id"]; // Unique per device
        const userId = headers["x-user-id"] ?? connectionId;
        // userConnections.set(connectionId, ws);

        if (!userId || userId.length < 4) ws.close(1011, "No User ID provided");

        // console.log("userId, connectionId:", userId, connectionId ?? null);

        await NotificationService.manager.recoverSingleConnection(ws, userId!);
      } catch (error) {
        console.error(error);
      }
    },
    async close(ws) {
      const headers = ws.data.headers;
      const connectionId = headers["x-connection-id"] ?? "";
      // const userId = headers['x-user-id'] ?? '';

      console.log("Closing connection:", connectionId);

      // Clean up subscriptions
      await NotificationService.manager.removeConnection(connectionId);

      await NotificationService.removeSubscription(connectionId);
    },
    message(ws, body) {
      const headers = ws.data.headers;
      const cookie = ws.data.cookie;
      // const { action, category } = body as any;
      const connectionId = headers["x-connection-id"] ?? "";
      const userId = headers["x-user-id"] ?? "";

      // if (action === 'subscribe') {
      //   controller.handleSubscribe({
      //     userId,
      //     connectionId,
      //     categories: [category],
      //   });
      // } else if (action === 'unsubscribe') {
      //   controller.handleUnsubscribe(connectionId);
      // }

      // ws.publish("msg", body);
      ws.send(`Received: ${JSON.stringify(body)}`);
    },
  })

  .get("/", () => "Notifications OK");

/* POST */

// HTTP route to notify subscribers
// .post('/notify', async ({ body }) => {
//     const { category, message } = body;
//     await controller.notifySubscribers(category, message);
//     set.statius
//     return { data: true };
// });
