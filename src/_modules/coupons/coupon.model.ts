import { DiscountType } from "@prisma/client";
import { t } from "elysia";


export interface ICreateCoupon {
    // id: string;
    code: string;
    name: string;
    discount: number;   
    discountType: DiscountType;
    expiresAt?: Date|null;
    maxUses: number;
}

interface ICouponLog {
    id: number;
    code: string;
    name: string;
    discount: number;
    discountType: string;
    timestamp: Date;
    expiresAt: Date;
    timesUsed: number;
    maxUses: number;
    usedByProfileId: string;
    usedByNames: string;
    usedFor: string;

    createdAt: Date;
}

export const CreateCouponDTO = t.Object({
    code: t.String({ maxLength: 8, minLength: 4 }),
    name: t.String(),
    discount: t.Number({ minimum: 0 }),   
    discountType: t.Enum(DiscountType),
    expiresAt: t.Optional(t.Union([ t.Null(), t.Date() ])),
    maxUses: t.Number({ default: 0, minimum: 0 })
})
export const ViewCouponDTO = t.Object({
    id: t.String(),
    code: t.String({ maxLength: 8, minLength: 4 }),
    name: t.String(),
    discount: t.Numeric(),   
    discountType: t.String(DiscountType),
    expiresAt: t.Optional(t.Date()),
    maxUses: t.Number({ default: 0, minimum: 0}),
    usedBy: t.Optional(t.Array(t.Object(t.Any()))),
    ownerProfileId: t.Optional(t.Nullable(t.String())),

    isActive: t.Boolean(),
    createdAt: t.Date()
})

export const CouponQueriesDTO = t.Object({
    usedBy: t.Optional(t.BooleanString()),
    isActive: t.Optional(t.BooleanString())
})