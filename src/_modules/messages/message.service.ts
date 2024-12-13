import { db } from "~config/prisma";
import { Message } from "@prisma/client";
import { ICreateMessage } from "./message.model";

export class MessageService {

    default(){
        return 'Message Service';
    }

    // Create a new message
    async createMessage(body: ICreateMessage, profileId?:string): Promise<Message> {
        const { senderId, recipientId, title, message, priority, deliveryMethods } = body;

        try {
            const payload: Message|null = await db.message.create({
                data: {
                    senderId: profileId ?? null,
                    recipientId,
                    title,
                    message,
                    priority,
                    deliveryMethods
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


    // Retrieve Messages by User's Profile ID
    async getMessagesByProfileId(profileId:string, query?:{ isRead?: boolean, isArchive?:boolean}) {
        return db.message.findMany({
            where: {
                senderId: profileId,
                isRead: query?.isRead,
                isArchived: query?.isArchive,
            }
        });
    }


    // Mark a message as "read"
    async markMessageAsRead(messageId:string) {
        return db.message.update({
            where: {
                id: messageId
            },
            data: {
                isRead: true
            }
        });
    }



}