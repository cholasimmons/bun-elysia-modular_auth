import {
  MessagePlain,
  MessagePlainInputCreate,
} from "@generated/prismabox/Message";
import { MessageDelivery, MessagePriority } from "@prisma/client";
import { t } from "elysia";

export const MessageInputCreateWithRecipient = t.Object({
  ...MessagePlainInputCreate.properties,
  recipientId: t.String(),
});

export type MessageInputCreate = typeof MessageInputCreateWithRecipient.static;

export interface ICreateMessage {
  recipientId: string;
  title: string;
  message: string;
  priority: MessagePriority;
  deliveryMethods: MessageDelivery[];
}

export const CreateMessageDTO = t.Object({
  recipientId: t.String(),
  title: t.String(),
  message: t.String(),
  priority: t.Optional(t.Enum(MessagePriority)),
  deliveryMethods: t.Optional(t.Array(t.Enum(MessageDelivery))),
});

export const MessageResponseDTO = t.Object({
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
});

export const MessageQueriesDTO = t.Object({
  isRead: t.Optional(t.BooleanString()),
  isArchived: t.Optional(t.BooleanString()),
});
