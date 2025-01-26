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
export const FilesBodyDTO: TSchema = t.Object({
    files: t.Array(t.File())
})
export const ImageBodyDTO: TSchema = t.Object({
    file: t.File({ type: "image" })
})
export const ImagesBodyDTO: TSchema = t.Object({
    files: t.Array(t.File({ type: 'image/*' }))
})
export interface IImageUpload {
    name: string;
    size: number;
    type: string;
    'X-Amz-Meta-UploaderUserId'?: string;
    'X-Amz-Meta-CreatedDate'?: string;
    'X-Amz-Meta-Mode'?: string;
    'X-Amz-Meta-Purpose'?: string;
}
export interface IFileUpload {
    name: string;
    size: number;
    type: string;
    'X-Amz-Meta-UploaderUserId'?: string;
    'X-Amz-Meta-CreatedDate'?: string;
    'X-Amz-Meta-Purpose'?: string;
}

/** No underscores */
export enum BucketType {
    PHOTOS="hello-photos",
    FILES="hello-files",
    USERS="hello-users"
}
export enum UploadMode {
    MAIN="main",
    THUMB="thumb",
    BLUR="blur"
}