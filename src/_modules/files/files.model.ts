import { TSchema, t } from "elysia";

export interface IFile {
    id: string;
    name: string;
    size: number;
    createdAt: Date;
}

export const FileBodyDTO: TSchema = t.Object({
    file: t.File()
})
export const ImageBodyDTO: TSchema = t.Object({
    file: t.File({ type: 'image/*' })
})
export const ImagesBodyDTO: TSchema = t.Object({
    files: t.Array(t.File({ type: 'image/*' }))
})
export interface IImageUpload {
    name: string;
    size: number;
    type: string;
    'X-Amz-Meta-UserProfileId'?: string;
    'X-Amz-Meta-CreatedDate'?: string;
}

export enum BucketType {
    PRODUCT="PRODUCTS",
    USER="USERS"
}