import { TSchema, t } from "elysia";
import { Currency } from "@prisma/client";


export const CreateWalletDTO: TSchema = t.Object({
    // profileId: t.String(),
    initialBalance: t.Optional(t.Number({default: 0.0})),
    currency: t.Optional(t.Enum(Currency)),
});
export const ViewWalletDTO: TSchema = t.Object({
    id: t.String(),
    userProfileId: t.Optional(t.String()),
    userProfile: t.Optional(t.Any()),
    balance: t.Numeric(),
    currency: t.Enum(Currency),
    transactions: t.Optional(t.Array(t.Object(t.Any()))),

    isActive: t.Boolean(),
    isComment: t.Optional(t.String()),
    createdAt: t.Date(),
    updatedAt: t.Date(),
});
export const ViewWalletLiteDTO: TSchema = t.Object({
    id: t.String(),
    userProfile: t.Optional(t.Any()),
    balance: t.Numeric(),
    currency: t.Enum(Currency),
    transactions: t.Optional(t.Array(t.Object(t.Any())))
});

export const WalletQueriesDTO = t.Object({
    transactions: t.Optional(t.BooleanString()),
    userProfile: t.Optional(t.BooleanString())
})

export const MakePaymentDTO = t.Object({
    amount: t.Number(),
    // discount: t.Optional(t.Number({default: 0})),
    discountCode: t.Optional(t.String()),
    reference: t.Optional(t.String()),
    // payeeWalletId: t.String(),
    currency: t.Optional(t.Enum(Currency)),

    longitude: t.Optional(t.Number()),
    latitude: t.Optional(t.Number())
})