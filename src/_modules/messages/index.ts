import Elysia, { t } from "elysia";
import {
  checkAuth,
  checkForProfile,
  checkIsAdmin,
  checkIsStaff,
} from "~middleware/authChecks";
import { MessageService } from "./message.service";
import {
  MessageQueriesDTO,
  CreateMessageDTO,
  MessageResponseDTO,
  MessageInputCreateWithRecipient,
} from "./message.model";
import { swaggerDetails } from "~utils/response_helper";
import {
  MessagePlain,
  MessagePlainInputCreate,
} from "@generated/prismabox/Message";
import { Message } from "@generated/prisma/client";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { redisMessagingService } from "~config/redis";
import { RedisEvents } from "~config/constants";
import { PrismaClientKnownRequestError } from "@generated/prisma/internal/prismaNamespace";
import { NotFoundError } from "~exceptions/custom_errors";

export const MessageRouter = new Elysia({
  prefix: "/messages",
  detail: { description: "Messaging System", tags: ["Messages"] },
})

  .onBeforeHandle([checkAuth, checkForProfile])

  /* GET */

  .get(
    "/",
    async ({ status, set, user: { id }, query }) => {
      try {
        const messages: Message[] | null =
          await MessageService.getMessagesByUserId(id, query);

        if (!messages) {
          return status(404, { message: "Could not retrieve Messages" });
        }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: messages,
          message: `Successfully retrieved ${messages.length} of your Messages`,
        });
      } catch (error: any) {
        console.error(error);

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
        return status(500, {
          message: "Could not retrieve your Messages",
          note: error.message,
        });
      }
    },
    {
      response: {
        200: t.Object({
          data: t.Array(MessagePlain),
          message: t.String({
            default: "Successfully retrieved 0 of your Messages",
          }),
        }),
        404: t.Object({
          message: t.String({ default: "Could not retrieve Messages" }),
        }),
        500: t.Object({
          message: t.String({ default: "Could not retrieve your Messages" }),
          note: t.String(),
        }),
      },
      detail: swaggerDetails(
        "Get Messages [SELF]",
        "Retrieve all of your Messages. [SELF]",
      ),
    },
  )

  .get(
    "/user/:profileId",
    async ({ status, set, params: { profileId }, query }) => {
      try {
        const messages: Message[] | null =
          await MessageService.getMessagesByUserId(profileId, query);

        if (!messages) {
          return status(404, { message: "Could not retrieve Messages" });
        }
        // set.status = HttpStatusEnum.HTTP_200_OK;
        //
        return status(200, {
          data: messages,
          message: `Successfully retrieved ${messages.length} Messages`,
        });
      } catch (error) {
        console.error(error);

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
        return status(500, {
          message: "Could not retrieve Messages",
        });
      }
    },
    {
      beforeHandle: [checkIsStaff, checkIsAdmin],
      params: t.Object({ profileId: t.String() }),
      response: {
        200: t.Object({
          data: t.Array(MessagePlain),
          message: t.String({ default: "Successfully retrieved 0 Messages" }),
        }),
        404: t.Object({
          message: t.String({ default: "Could not retrieve Messages" }),
        }),
        500: t.Object({
          message: t.String({ default: "Could not retrieve Messages" }),
        }),
      },
      detail: swaggerDetails(
        "Get User's Messages [ADMIN|STAFF]",
        "Retrieve all of a User's Messages by their Profile ID",
      ),
    },
  )

  .get("/health", "Messages OK")

  /* POST */

  .post(
    "/send-email",
    async ({ status, set, user, query, body }) => {
      const userId = user.id ?? "1234";

      try {
        // Create and send the message
        const message: Message | null =
          await MessageService.createAndSendMessageSafely(body, userId);

        if (!message) {
          return status(404, { message: "Could not transmit Message" });
        }
        // Publish the message event
        redisMessagingService.publish(RedisEvents.MESSAGE, {
          action: RedisEvents.MESSAGE_SENT,
          message,
        });

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: message,
          message: `Successfully sent Message (${message.deliveryMethods})`,
        });
      } catch (error) {
        console.error(error);

        // throw error;

        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
        return status(500, { message: "Unable to send Message." });
      }
    },
    {
      // beforeHandle: [ checkForProfile ],
      body: MessageInputCreateWithRecipient,
      query: MessageQueriesDTO,
      response: {
        200: t.Object({
          data: MessagePlain,
          message: t.String({
            default: "Successfully sent Message ([deliveryMethods])",
          }),
        }),
        404: t.Object({
          message: t.String({ default: "Could not retrieve Messages" }),
        }),
        500: t.Object({
          message: t.String({ default: "Unable to send Message" }),
        }),
      },
      detail: swaggerDetails("Send Message", "Creates and sends a Message."),
    },
  )

  /* PATCH */

  .patch(
    "/read/:messageId",
    async ({ status, set, user, params: { messageId } }) => {
      const user_id = user?.id;

      try {
        const message: Message | null = await MessageService.markMessageAsRead(
          messageId,
          user_id,
        );

        if (!message) {
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(404, {
            message: "Unable to mark as read. Is this your message?",
          });
        }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(204, {
          data: message,
          message: "Message marked as read",
        });
      } catch (error: any) {
        console.error(error);

        if (error instanceof PrismaClientKnownRequestError) {
          throw new NotFoundError("You have no message with that ID");
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          // return { message: 'Message not found', error: error.cause ?? error.message };
        }

        // throw error;
        return status(500, { message: "Could not mark message as read" });
      }
    },
    {
      params: t.Object({ messageId: t.String() }),
      response: {
        204: t.Object({
          data: MessagePlain,
          message: t.String({ default: "Message marked as read" }),
        }),
        404: t.Object({
          message: t.String({
            default: "Unable to mark as read. Is this your message?",
          }),
        }),
        500: t.Object({
          message: t.String({ default: "Could not mark message as read" }),
        }),
      },
      detail: swaggerDetails(
        "PATCH Message as Read",
        "Marks message as read by Message ID",
      ),
    },
  )

  .patch(
    "/archive/:messageId",
    async ({ status, set, user, params: { messageId } }) => {
      const user_id = user?.id;

      try {
        const message: Message | null =
          await MessageService.markMessageAsArchived(messageId, user_id);

        if (!message) {
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(404, {
            message: "Unable to archive. Is this your message?",
          });
        }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(204, { data: message, message: "Message archived" });
      } catch (error: any) {
        console.error(error);

        if (error instanceof PrismaClientKnownRequestError) {
          throw new NotFoundError("You have no message with that ID");
        }

        // throw error
        return status(500, { message: "Could not archive message" });
      }
    },
    {
      params: t.Object({ messageId: t.String() }),
      response: {
        204: t.Object({
          data: MessagePlain,
          message: t.String({ default: "Message archived" }),
        }),
        404: t.Object({
          message: t.String({
            default: "Unable to archive. Is this your message?",
          }),
        }),
        500: t.Object({
          message: t.String({ default: "Could not archive message" }),
        }),
      },
      detail: swaggerDetails(
        "PATCH Message as Archived",
        "Marks message as archived by Message ID",
      ),
    },
  )

  /* DELETE */

  .delete(
    "/:messageId",
    async ({ status, set, user, params: { messageId } }) => {
      const user_id = user?.id;

      try {
        const message: Message | null = await MessageService.deleteMessage(
          messageId,
          user_id,
        );

        if (!message) {
          // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
          return status(404, {
            message: "Unable to delete. Is this your message?",
          });
        }

        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, { message: "Message deleted" });
      } catch (error: any) {
        console.error(error);

        if (error instanceof PrismaClientKnownRequestError) {
          throw new NotFoundError("You have no message with that ID");
        }

        // throw error
        return status(500, { message: "Could not delete message" });
      }
    },
    {
      params: t.Object({ messageId: t.String() }),
      response: {
        200: t.Object({
          message: t.String({ default: "Message deleted" }),
        }),
        404: t.Object({
          message: t.String({
            default: "Unable to delete. Is this your message?",
          }),
        }),
        500: t.Object({
          message: t.String({ default: "Could not delete message" }),
        }),
      },
      detail: swaggerDetails("DELETE Message", "Sets message to be deleted"),
    },
  );
