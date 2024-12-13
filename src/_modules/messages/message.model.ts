import { DiscountType, MessageDelivery, MessagePriority } from "@prisma/client";
import { t } from "elysia";


export interface ICreateMessage {
    senderId: string,
    recipientId: string,
    title: string,
    message: string,
    priority: MessagePriority,
    deliveryMethods: MessageDelivery[]
}


export const CreateMessageDTO = t.Object({
    recipientId: t.String(),
    title: t.String(),
    message: t.String(),
    priority: t.Enum(MessagePriority),
    deliveryMethods: t.Enum(MessageDelivery)
})

export const ViewMessageDTO = t.Object({
    id: t.String(),
    recipientId: t.String(),
    title: t.String(),
    message: t.String(),
    priority: t.Enum(MessagePriority),
    deliveryMethods: t.Enum(MessageDelivery),
    isRead: t.Boolean(),
    isArchived: t.Boolean(),

    createdAt: t.Date(),
    updatedAt: t.Optional(t.Date()),
})

export const MessageQueriesDTO = t.Object({
    isRead: t.Optional(t.BooleanString()),
    isArchived: t.Optional(t.BooleanString())
})