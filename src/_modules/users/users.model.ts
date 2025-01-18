import { TSchema, t } from "elysia";
import { DocumentType, Gender, Prisma, Profile, Role, SubscriptionType, User } from "@prisma/client";

export const ProfileBodyDTO = t.Object({
    firstname: t.Optional(t.String()),
    lastname: t.Optional(t.String()),
    photo: t.Optional(t.File({type: 'image'})),
    documentId: t.String({maxLength: 12}),
    documentType: t.Enum(DocumentType),
    gender: t.Optional(t.Enum(Gender)),
    phone: t.Optional(t.Nullable(t.String())),
    email: t.Optional(t.String({ format:"email", default:'abc@email.com' })),
    bio: t.Optional(t.String()),
    userId: t.Optional(t.Nullable(t.String()))
});
export const ProfileResponseDTO: TSchema = t.Object({
    id: t.String(),
    bio: t.Optional(t.Nullable(t.String())),
    userId: t.Optional(t.Nullable(t.String())),
    user: t.Optional(t.Nullable(t.Any())),
    documentId: t.String({maxLength: 12}),
    documentType: t.Enum(DocumentType),
    photo: t.Optional(t.Nullable(t.String())),
    gender: t.Enum(Gender),

    firstname: t.String(),
    lastname: t.String(),
    phone: t.Optional(t.Nullable(t.String())),
    email: t.String({ format:"email", default:'abc@email.com' }),

    supportLevel: t.Number(),
    subscriptionType: t.Enum(SubscriptionType),
    subscription: t.Optional(t.Nullable(t.Any())),

    wallet: t.Optional(t.Any()),
    usedCoupons: t.Optional(t.Nullable(t.Array(t.MaybeEmpty(t.Any())))),

    isActive: t.Boolean(),
    isComment: t.Optional(t.Nullable(t.String())),
    createdAt: t.Date(),
    updatedAt: t.Optional(t.Date())
});
export const updateProfileBodyDTO = {
    bio: t.Optional(t.String()),
    photo: t.Optional(t.File({type: 'image'})),
    firstname: t.Optional(t.String()),
    lastname: t.Optional(t.String()),
    // address: t.Optional(t.String()),
    documentId: t.Optional(t.String({maxLength: 12})),
    documentType: t.Optional(t.Enum(DocumentType)),
    gender: t.Optional(t.Enum(Gender)),
    supportLevel: t.Optional(t.Number()),
    phone: t.Optional(t.String()),

    isActive: t.Optional(t.BooleanString()),
    isComment: t.Optional(t.String())
};

export const UserResponseDTO: TSchema = t.Object({
    id: t.String(),
    firstname: t.String(),
    lastname: t.String(),
    username: t.String(),
    email: t.String({ format: 'email', default: 'abc@email.com' }),
    emailVerified: t.Boolean(),
    phone: t.Optional(t.Nullable(t.String())),
    roles: t.Array(t.Enum(Role)),
    profile: t.Optional(t.Nullable(ProfileResponseDTO)),
    profileId: t.Optional(t.Nullable(t.String())),

    oauth: t.Optional(t.Nullable(t.Any())),
    authSession: t.Optional(t.Nullable(t.Array(t.Any()))),

    isActive: t.Boolean(),
    isComment: t.Optional(t.Nullable(t.String())),
    createdAt: t.Date(),
    updatedAt: t.Optional(t.Nullable(t.Date()))
})

export const profileQueriesDTO = {
    account: t.Optional(t.Boolean({ default: false })),
    subscription: t.Optional(t.Boolean({ default: false })),
    usedCoupons: t.Optional(t.Boolean({ default: false })),
}
export const userQueriesDTO = {
    isActive: t.Optional(t.BooleanString()),
    profile: t.Optional(t.BooleanString({default: false})),
}


export const AutoUserBodyDTO = t.Object({
    names: t.String(),
    email: t.String({ format:'email', default:'abc@email.com' }),
    phone: t.String({ maxLength:12 }),
    roles: t.Array(t.Enum(Role)),
    supportLevel: t.Optional(t.Number())
})
export const AutoUserResponseDTO = t.Object({
    id: t.Integer(),

    names: t.String(),
    email: t.String(),
    phone: t.String(),
    roles: t.Array(t.Enum(Role)),
    supportLevel: t.Optional(t.Number()),

    isActive: t.Optional(t.Boolean()),
    isComment: t.Optional(t.Nullable(t.String())),
    createdAt: t.Optional(t.Date())
})

// Custom type of a User model that includes a Profile relation 😎
export type PrismaUserWithProfile = Prisma.UserGetPayload<{
    include: {
        profile: true
    }
}>;
export type PrismaUserWithOptionalProfile = Prisma.UserGetPayload<{
    include: {
        profile?: true
    }
}>;
export type ProfileWithUser = Prisma.ProfileGetPayload<{
    include: {
        user: {
            select: {
                roles: true,
                emailVerified: true,
                createdAt: true
            }
        },
        usedCoupons: false
    }
}>;




// Custom type of a Partial User model that includes a Profile relation 😎
export type PartialUserWithProfile = Partial<User> & { profile?: Profile|null;}

// Custom type of a Profile model that includes a User Account relation 😎
export type ProfileWithPartialUser = Profile & { user?: Partial<User>|null;}

// Custom type of a Profile model that includes a "safe" User Account relation (no sensitive data) 😎
export type ProfileWithSafeUser = Prisma.ProfileGetPayload<{
    include: {
        user: {
            select: {
                id: true,
                firstname: true,
                lastname: true,
                username: true,
                roles: true,
                email: true,
                phone: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
                profileId: true
            }
        }
    }
}>
export type ProfileWithSafeUserModel = Profile & {
    user?: SafeUser
};

export type SafeUser = Prisma.UserGetPayload<{
    select: {
        id: true,
        firstname: true,
        lastname: true,
        username: true,
        roles: true,
        email: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        profileId: true,
        isActive: true,
        isComment: true
    }
}>;