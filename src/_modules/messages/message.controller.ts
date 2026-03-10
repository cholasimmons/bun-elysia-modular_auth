import { HttpStatusEnum } from "elysia-http-status-code/status";
import { MessageService } from "./message.service";
import { Coupon, Message } from "@generated/prisma/client";
import { redisGet, redisMessagingService, redisSet } from "~config/redis";
import {
  ConflictError,
  NotFoundError,
  RateLimitError,
} from "~exceptions/custom_errors";
import { RedisEvents, RedisKeys } from "~config/constants";
import { PrismaClientKnownRequestError } from "@generated/prisma/internal/prismaNamespace";

export class MessageController {
  sendMessage = async ({ set, user: { id }, query, body }: any) => {
    // const { senderId, recipientId, title, message, priority, deliveryMethods } = body;

    const cacheKey = RedisKeys.COOLDOWN(id); // Unique key for the sender

    try {
      const isCooldown = await redisGet(cacheKey);

      if (isCooldown) {
        throw new RateLimitError(
          "You can only send one message every 15 seconds",
        );
        // set.status = HttpStatusEnum.HTTP_429_TOO_MANY_REQUESTS;
        // return { message: 'You can only send one message every 15 seconds', error: "Too many requests" };
      }

      // Optionally, generate a hash of the message to detect duplicates
      const hasher = new Bun.CryptoHasher("sha256");
      const messageHash = `message-hash:${id}:${hasher.update(JSON.stringify(body), "hex").digest()}`;
      const isDuplicate = await redisGet(messageHash);

      if (isDuplicate) {
        throw new ConflictError("This message has already been sent");
        // set.status = HttpStatusEnum.HTTP_409_CONFLICT;
        // return { message: 'This message has already been sent', error: "Conflict" };
      }

      // Create and send the message
      const message: Message | null = await MessageService.createAndSendMessage(
        body,
        id,
      );

      // Publish the message event
      redisMessagingService.publish(RedisEvents.MESSAGE, {
        action: RedisEvents.MESSAGE_SENT,
        message,
      });

      // Set a 15-second cooldown for this sender
      await redisSet(cacheKey, true, 0.25);

      // Cache the message hash for a longer period to prevent duplicates
      await redisSet(messageHash, true, 60); // 1 hour or as needed

      set.status = HttpStatusEnum.HTTP_200_OK;
      return {
        data: message,
        message: `Successfully sent Message (${message.deliveryMethods})`,
      };
    } catch (error) {
      // console.error(error);

      throw error;

      // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
      // return { message: 'Unable to send Message.' }
    }
  };
}
