import { MessageDelivery, MessagePriority } from "@prisma/client";
import { t } from "elysia";


export interface ICreateNotification {
    recipientId: string,
    title: string,
    message: string,
    priority: MessagePriority,
    deliveryMethods: MessageDelivery[]
}


export const CreateNotificationDTO = t.Object({
    recipientId: t.String(),
    title: t.String(),
    message: t.String(),
    priority: t.Optional(t.Enum(MessagePriority)),
    deliveryMethods: t.Optional(t.Array(t.Enum(MessageDelivery)))
})

export const NotificationResponseDTO = t.Object({
    id: t.String(),
    senderId: t.String(),
    // recipientId: t.String(),
    title: t.String(),
    message: t.String(),
    priority: t.Enum(MessagePriority),
    deliveryMethods: t.Array(t.Enum(MessageDelivery)),
    isRead: t.Boolean(),
    isArchived: t.Boolean(),

    createdAt: t.Date(),
    updatedAt: t.Optional(t.Date()),
})

export const NotificationQueriesDTO = t.Object({
    isRead: t.Optional(t.BooleanString()),
    isArchived: t.Optional(t.BooleanString())
})

export interface IWSConnection {
    userId: string;
    connectionId: string; // Unique WebSocket connection ID (device-level)
    // categories: string[];
  }