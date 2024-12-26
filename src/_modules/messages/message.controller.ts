import { HttpStatusEnum } from "elysia-http-status-code/status";
import { MessageService, ICreateMessage } from ".";
import { db } from "~config/prisma";
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { Coupon, Message } from "@prisma/client";

export class MessageController {
    private messageSvc: MessageService;

    constructor(){
        this.messageSvc = new MessageService();
    }


    async getMyMessages({ set, user: { profileId }, query }: any){

        try {
            const messages = await this.messageSvc.getMessagesByProfileId(profileId, query);
            
            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: messages, message: `Successfully retrieved ${messages.length} of your Messages` };
        } catch (error) {
            console.error(error);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return { message: 'Could not retrieve your Messages' }
        }
    }

    async getMessagesByProfileId({ set, params:{ profileId }, query }: any){
        try {
            const messages = await this.messageSvc.getMessagesByProfileId(profileId, query);
            
            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: messages, message: `Successfully retrieved ${messages.length} Messages` };
        } catch (error) {
            console.error(error);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return { message: 'Could not retrieve Messages' }
        }
    }


    async sendMessage({ set, user: { profileId }, query, body }:any){
        // const { senderId, recipientId, title, message, priority, deliveryMethods } = body;

        try {
            const message: Message|null = await this.messageSvc.createMessage(body, profileId);

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: message, message: `Successfully sent Message (${message.deliveryMethods})` };
        } catch (error) {
            console.error(error);
            
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return { message: 'Unable to send Message.' }
        }
    }



    
    async markAsRead({ set, params: {messageId} }: any){
        try {
            const message: Message|null = await this.messageSvc.markMessageAsRead(messageId);

            if(!message) {
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'No message with that ID found' };
            }
            
            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: message, message: 'Message marked as read' };
        } catch (error:any) {
            console.error(error);
            
            set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
            return { message: error.message ?? 'Could not mark message as read' };
        }
    }
}