import { db } from "~config/prisma";
import { Message } from "@generated/prisma/client";
import {
  ICreateMessage,
  MessageInputCreate,
  MessageInputCreateWithRecipient,
} from "./message.model";
import { redisGet, redisSet } from "~config/redis";
import { ConflictError, RateLimitError } from "~exceptions/custom_errors";

export abstract class MessageService {
  default() {
    return "Message Service";
  }

  // Create a new message and send it (to DB)
  static async createAndSendMessage(
    body: MessageInputCreate,
    userId?: string,
  ): Promise<Message> {
    const { recipientId, title, message, priority, deliveryMethods } = body;

    try {
      const payload: Message | null = await db.message.create({
        data: {
          senderId: userId ?? null,
          recipientId,
          title,
          message,
          priority,
          deliveryMethods: deliveryMethods,
        },
        // include: {
        //     usedBy: query?.usedBy ?? false,
        // }
      });

      return payload;
    } catch (error) {
      throw error;
    }
  }

  // Create a new message and send it safely (rate-limited and spam protected)
  static async createAndSendMessageSafely(
    body: MessageInputCreate,
    userId?: string,
  ): Promise<Message> {
    const { recipientId, title, message, priority, deliveryMethods } = body;
    const cacheKey = `message-cooldown:${userId}`; // Unique key for the sender

    try {
      const isCooldown = await redisGet(cacheKey);

      if (isCooldown) {
        throw new RateLimitError(
          "You can only send one message every 15 seconds",
        );
      }

      // Optionally, generate a hash of the message to detect duplicates
      const hasher = new Bun.CryptoHasher("sha256");
      const stringMessage = JSON.stringify(message);
      const messageHash = `message-hash:${userId}:${hasher.update(stringMessage, "utf-8").digest()}`;

      // Search cache for the exact message
      const isDuplicate = await redisGet(messageHash);

      if (isDuplicate) {
        throw new ConflictError("This message has already been sent");
      }

      // Create message in db
      const payload: Message | null = await db.message.create({
        data: {
          senderId: userId ?? null,
          recipientId,
          title,
          message,
          priority,
          deliveryMethods,
        },
      });

      // Set a 15-second cooldown for this sender
      await redisSet(cacheKey, true, 0.25);

      // Cache the message hash for a longer period to prevent duplicates
      await redisSet(messageHash, true, 10); // 1 hour or as needed

      return payload;
    } catch (error) {
      throw error;
    }
  }

  // Retrieve Messages by User's  ID
  static async getMessagesByUserId(
    userId: string,
    query?: { isRead?: boolean; isArchive?: boolean },
  ) {
    return db.message.findMany({
      where: {
        recipientId: userId,
        isRead: query?.isRead,
        isArchived: query?.isArchive,
      },
    });
  }

  // Mark a message as "read"
  static async markMessageAsRead(messageId: string, userId: string) {
    return db.message.update({
      where: {
        id: messageId,
        recipientId: userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  // Archive message
  static async markMessageAsArchived(messageId: string, userId: string) {
    return db.message.update({
      where: {
        id: messageId,
        recipientId: userId,
      },
      data: {
        isArchived: true,
      },
    });
  }

  // Delete message
  static async deleteMessage(messageId: string, userId: string) {
    return db.message.update({
      where: {
        id: messageId,
        recipientId: userId,
      },
      data: {
        isActive: false,
      },
    });
  }

  /** CRON function
   * Deletes all inactive messages older than 30 days
   */
  static async clearDeletedMessages(durationInDays: number = 30) {
    const now = new Date(); // Current date and time
    const cutoffDate = new Date(
      now.getTime() - durationInDays * 24 * 60 * 60 * 1000,
    ); // Calculate the cutoff date

    return db.message.deleteMany({
      where: {
        isActive: false,
        updatedAt: {
          lte: cutoffDate,
        },
      },
    });
  }
}
