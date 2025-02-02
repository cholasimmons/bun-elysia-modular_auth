import { HttpStatusEnum } from "elysia-http-status-code/status";
import { MessageService, ICreateMessage } from ".";
import { db } from "~config/prisma";
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { Coupon, Message } from "@prisma/client";
import { redisGet, redisMessagingService, redisSet } from "~config/redis";
import { ConflictError, NotFoundError, RateLimitError } from "src/_exceptions/custom_errors";
import { emailQueue } from "~queues/queues";
import { RedisEvents, RedisKeys } from "~config/constants";

export class MessageController {
    private messageSvc: MessageService;

    constructor(){
        this.messageSvc = MessageService.instance;
    }


    getMyMessages = async({ set, user: { id }, query }: any) => {
        try {
            const messages: Message[]|null = await this.messageSvc.getMessagesByUserId(id, query);
            
            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: messages, message: `Successfully retrieved ${messages.length} of your Messages` };
        } catch (error:any) {
            console.error(error);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return { message: 'Could not retrieve your Messages', note: error.message }
        }
    }

    getMessagesByUserId = async({ set, params:{ userId }, query }: any) => {
        try {
            const messages: Message[]|null = await this.messageSvc.getMessagesByUserId(userId, query);
            
            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: messages, message: `Successfully retrieved ${messages.length} Messages` };
        } catch (error) {
            console.error(error);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return { message: 'Could not retrieve Messages' }
        }
    }


    sendMessage = async({ set, user: { id }, query, body }:any) => {
        // const { senderId, recipientId, title, message, priority, deliveryMethods } = body;

        const cacheKey = RedisKeys.COOLDOWN(id); // Unique key for the sender

        try {
            const isCooldown = await redisGet(cacheKey);

            if (isCooldown) {
                throw new RateLimitError('You can only send one message every 15 seconds');
                // set.status = HttpStatusEnum.HTTP_429_TOO_MANY_REQUESTS;
                // return { message: 'You can only send one message every 15 seconds', error: "Too many requests" };
            }

            // Optionally, generate a hash of the message to detect duplicates
            const hasher = new Bun.CryptoHasher("sha256");
            const messageHash = `message-hash:${id}:${hasher.update(JSON.stringify(body), "hex").digest()}`;
            const isDuplicate = await redisGet(messageHash);

            if (isDuplicate) {
                throw new ConflictError('This message has already been sent');
                // set.status = HttpStatusEnum.HTTP_409_CONFLICT;
                // return { message: 'This message has already been sent', error: "Conflict" };
            }

            // Create and send the message
            const message: Message|null = await this.messageSvc.createAndSendMessage(body, id);

            // Publish the message event
            redisMessagingService.publish(RedisEvents.MESSAGE, {
                action: RedisEvents.MESSAGE_SENT,
                message
            });

            // Set a 15-second cooldown for this sender
            await redisSet(cacheKey, true, 0.25);

            // Cache the message hash for a longer period to prevent duplicates
            await redisSet(messageHash, true, 60); // 1 hour or as needed
           

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: message, message: `Successfully sent Message (${message.deliveryMethods})` };
        } catch (error) {
            // console.error(error);

            throw error;
            
            // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            // return { message: 'Unable to send Message.' }
        }
    }

    sendMessageSafely = async({ set, user, query, body }:any) => {
        const userId = user.id ?? '1234';

        try {
            // Create and send the message
            const message: Message|null = await this.messageSvc.createAndSendMessageSafely(body, userId);

            // Publish the message event
            redisMessagingService.publish(RedisEvents.MESSAGE, {
                action: RedisEvents.MESSAGE_SENT,
                message
            });

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: message, message: `Successfully sent Message (${message.deliveryMethods})` };
        } catch (error) {
            // console.error(error);

            throw error;
            
            // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            // return { message: 'Unable to send Message.' }
        }
    }



    
    markAsRead = async({ set, user, params: {messageId} }: any) => {
        const user_id = user?.id;

        try {
            const message: Message|null = await this.messageSvc.markMessageAsRead(messageId, user_id);

            if(!message) {
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'Unable to mark as read. Is this your message?' };
            }
            
            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: message, message: 'Message marked as read' };
        } catch (error:any) {
            console.error(error);

            if(error instanceof PrismaClientKnownRequestError){
                throw new NotFoundError("You have no message with that ID");
                // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                // return { message: 'Message not found', error: error.cause ?? error.message };
            }
            
            throw error;
        }
    }

    markAsArchived = async({ set, user, params: {messageId} }: any) => {
        const user_id = user?.id;

        try {
            const message: Message|null = await this.messageSvc.markMessageAsArchived(messageId, user_id);

            if(!message) {
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'Unable to archive. Is this your message?' };
            }
            
            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: message, message: 'Message archived' };
        } catch (error:any) {
            console.error(error);

            if(error instanceof PrismaClientKnownRequestError){
                throw new NotFoundError("You have no message with that ID");
            }
            
            throw error
        }
    }

    deleteMessage = async({ set, user, params: {messageId} }: any) => {
        const user_id = user?.id;

        try {
            const message: Message|null = await this.messageSvc.deleteMessage(messageId, user_id);

            if(!message) {
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'Unable to delete. Is this your message?' };
            }
            
            set.status = HttpStatusEnum.HTTP_200_OK;
            return { message: 'Message deleted' };
        } catch (error:any) {
            console.error(error);
            
            if(error instanceof PrismaClientKnownRequestError){
                throw new NotFoundError("You have no message with that ID");
            }
            
            throw error
        }
    }
}