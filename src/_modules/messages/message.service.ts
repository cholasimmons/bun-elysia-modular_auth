import { db } from "~config/prisma";
import { Message } from "@prisma/client";
import { ICreateMessage } from "./message.model";
import { redisGet, redisSet } from "~config/redis";
import { ConflictError, RateLimitError } from "~exceptions/custom_errors";

export class MessageService {
    private static instance: MessageService;

    public static getInstance(): MessageService {
        if (!MessageService.instance) {
            MessageService.instance = new MessageService();
        }
        
        return MessageService.instance;
    }

    default(){
        return 'Message Service';
    }

    // Create a new message and send it (to DB)
    async createAndSendMessage(body: ICreateMessage, userId?:string): Promise<Message> {
        const { recipientId, title, message, priority, deliveryMethods } = body;

        try {
            const payload: Message|null = await db.message.create({
                data: {
                    senderId: userId ?? null,
                    recipientId,
                    title,
                    message,
                    priority,
                    deliveryMethods: deliveryMethods
                },
                // include: {
                //     usedBy: query?.usedBy ?? false,
                // }
            });
            
            return payload;
        } catch (error) {
            throw error
        }
    };

    // Create a new message and send it safely (rate-limited and spam protected)
    async createAndSendMessageSafely(body: ICreateMessage, userId?:string): Promise<Message> {
        const { recipientId, title, message, priority, deliveryMethods } = body;
        const cacheKey = `message-cooldown:${userId}`; // Unique key for the sender

        try {
            const isCooldown = await redisGet(cacheKey);

            if (isCooldown) {
                throw new RateLimitError('You can only send one message every 15 seconds');
            }

            // Optionally, generate a hash of the message to detect duplicates
            const hasher = new Bun.CryptoHasher("sha256");
            const messageHash = `message-hash:${userId}:${hasher.update(JSON.stringify(body), "hex").digest()}`;
            
            // Search cache for the exact message
            const isDuplicate = await redisGet(messageHash);

            if (isDuplicate) {
                throw new ConflictError('This message has already been sent');
            }
            
            // Create message in db
            const payload: Message|null = await db.message.create({
                data: {
                    senderId: userId ?? null,
                    recipientId,
                    title,
                    message,
                    priority,
                    deliveryMethods
                }
            });

            // Set a 15-second cooldown for this sender
            await redisSet(cacheKey, true, 0.25);

            // Cache the message hash for a longer period to prevent duplicates
            await redisSet(messageHash, true, 60); // 1 hour or as needed
            
            return payload;
        } catch (error) {
            throw error
        }
    };


    // Retrieve Messages by User's Profile ID
    async getMessagesByUserId(userId:string, query?:{ isRead?: boolean, isArchive?:boolean}) {
        return db.message.findMany({
            where: {
                recipientId: userId,
                isRead: query?.isRead,
                isArchived: query?.isArchive,
            }
        });
    }


    // Mark a message as "read"
    async markMessageAsRead(messageId:string, userId:string) {
        return db.message.update({
            where: {
                id: messageId,
                recipientId: userId
            },
            data: {
                isRead: true
            }
        });
    }

    // Archive message
    async markMessageAsArchived(messageId:string, userId:string) {
        return db.message.update({
            where: {
                id: messageId,
                recipientId: userId
            },
            data: {
                isArchived: true
            }
        });
    }

    // Delete message
    async deleteMessage(messageId:string, userId:string) {
        return db.message.update({
            where: {
                id: messageId,
                recipientId: userId
            },
            data: {
                isActive: false
            }
        });
    }

    /** CRON function
     * Deletes all inactive messages older than 30 days
     */
    async clearDeletedMessages(durationInDays: number = 30) {
        const now = new Date(); // Current date and time
        const cutoffDate = new Date(now.getTime() - (durationInDays * 24 * 60 * 60 * 1000)); // Calculate the cutoff date
    
        return db.message.deleteMany({
            where: {
                isActive: false,
                updatedAt: {
                    lte: cutoffDate
                }
            }
        });
    }
}