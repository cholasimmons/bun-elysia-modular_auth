import { TSchema, t } from "elysia";
import { DocumentType, Gender, Role } from "@prisma/client";

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
    user: t.Optional(t.Nullable(t.Object({}))),
    documentId: t.String({maxLength: 12}),
    documentType: t.String(DocumentType),
    photoId: t.Optional(t.Nullable(t.String())),
    gender: t.String(Gender),

    firstname: t.String(),
    lastname: t.String(),
    phone: t.Optional(t.Nullable(t.String())),
    email: t.String({ format:"email", default:'abc@email.com' }),

    isActive: t.Boolean(),
    isComment: t.Optional(t.Nullable(t.String())),
    createdAt: t.Date(),
    updatedAt: t.Optional(t.Date())
});
export const UpdateProfileBodyDTO: TSchema = t.Object({
    bio: t.Optional(t.String()),
    photo: t.Optional(t.File({type: 'image'})),
    firstname: t.Optional(t.String()),
    lastname: t.Optional(t.String()),
    // address: t.Optional(t.String()),
    gender: t.Optional(t.Enum(Gender)),
    supportLevel: t.Optional(t.Number()),
    phone: t.Optional(t.String()),

    isActive: t.Optional(t.Boolean()),
    isComment: t.Optional(t.String())
});

export const UserResponseDTO: TSchema = t.Object({
    id: t.Optional(t.String()),
    firstname: t.String(),
    lastname: t.String(),
    email: t.String({ format: 'email', default: 'abc@email.com' }),
    emailVerified: t.Boolean(),
    phone: t.Optional(t.Nullable(t.String())),
    roles: t.Array(t.Enum(Role)),
    profile: t.Optional(t.Nullable(ProfileResponseDTO)),
    // profileId: t.Optional(t.Nullable(t.String())),

    isActive: t.Optional(t.Boolean()),
    isComment: t.Optional(t.Nullable(t.String())),
    createdAt: t.Optional(t.Date())
})

export const ProfileQueriesDTO = t.Object({
    account: t.Optional(t.BooleanString({ default: false })),
})
export const UserQueriesDTO = t.Object({
    profile: t.Optional(t.Boolean({default: false})),
})


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