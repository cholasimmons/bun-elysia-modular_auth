import { HttpStatusEnum } from "elysia-http-status-code/status";
import { FilesService } from ".";
import mime from "mime";
import { BucketType, IFileUpload, IImageUpload } from "./files.model";
import { db, prismaSearch } from "~config/prisma";
import { minioClient } from "~config/minioClient";
import { FileStatus, FileUpload } from "@prisma/client";
import { Context } from "elysia";
import { fileQueue, queueOptions } from "~queues/queues";

const BUCKET_USERS: string = Bun.env.BUCKET_USERS || 'hello-users';
const BUCKET_PRODUCTS: string = Bun.env.BUCKET_PRODUCTS || 'hello-products';
const BUCKET_PHOTOS: string = Bun.env.BUCKET_PHOTOS || 'hello-photos';

export class FilesController {

    constructor(private filesService: FilesService){
        // this.filesService = new FilesService();
    }

    getAllFiles = async ({ set }:any) => {
        const BUCKET = BucketType.FILES
        console.log('[File Controller]...');
        
        try {
            const files = await this.filesService.listAllFiles(BUCKET);
        
            set.status = 200;
            return { data: files, message: 'Loaded all files'};
        } catch (error) {
            throw error;
        }
    }

    getByFilename = async({ set, params: { filename } }: any) => {
        const BUCKET = BucketType.FILES;

        try {
            console.log(`Fetching ${BUCKET}: ${filename}`);
            
            const file: Blob = await this.filesService.getFileByName(filename, BUCKET);


            set.headers['Content-Type'] = 'file/*';
            return { data: file, message: 'File loaded' }
            // return file
        } catch (error) {
            console.error(error);

            throw error;
        }
    }
    getByPhotoname = async({ set, params: { filename } }: any) => {
        const BUCKET = BucketType.PHOTOS;

        try {
            console.log(`Fetching ${BUCKET}: ${filename}`);
            
            const file: Blob = await this.filesService.getFileByName(filename, BUCKET);


            set.headers['Content-Type'] = 'image/*';
            return { data: file, message: 'Image loaded' }
        } catch (error) {
            console.error(error);

            throw error;
        }
    }

    getFilesByUserId = async({ set, user, params, query }: any) => {
        // const { page, limit, orderBy, search, include } = query;
        const user_id = params?.userId ?? user.id ?? null;
        try {
            // await prismaSearch();
            const files = await this.filesService.getFilesByUserId(user_id);

            // set.headers['Content-Type'] = 'image/*';
            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: files, message: `${files.length} User\'s files loaded` }
            // return file
        } catch (error) {
            console.error(error);

            throw error;
        }
        
    }

    /** Upload a single file, not image */
    addSingleFile = async({ set, user, body: { file } }: any) => {
        const BUCKET: BucketType = BucketType.FILES;
        
        try {
            const upload = await db.$transaction(async (tx) =>{
                const fsx: IFileUpload|null = await this.filesService.uploadFile(file, BUCKET, user.id, file.name);

                if(!fsx){
                    set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
                    return { message: 'Unable to upload file'};
                }

                const uploaded =  await tx.fileUpload.create({
                    data:{
                        origName: file.name,
                        fileName: fsx?.name,
                        fileType: fsx.type,
                        fileSize: fsx.size,
                        bucket: BUCKET,
                        key: fsx.name,
                        path: `/${BUCKET.toLowerCase()}/${fsx.name}`,
                        isPublic: false,
                        uploaderUserId: user.id,
                        metadata: JSON.stringify(fsx),
                        tags: ["file", mime.getExtension(file.type)!],
                        status: FileStatus.UPLOADED
                    }
                })

                fileQueue.add('file:upload', uploaded, queueOptions());
            })
           

            set.status = HttpStatusEnum.HTTP_201_CREATED;
            return { data: upload, message: `${mime.getExtension(file.type)} uploaded to ${BUCKET}` }
        } catch (error:any) {

            throw error;
        }
    }

    /** Upload multiple files, not images */
    addMultipleFiles = async({ set, user, body: { files, objectId } }: any) => {
        const BUCKET = BucketType.FILES;
        
        try {
            let fsx: IFileUpload[]|null = null;
            let logs: FileUpload[]|null = null;

            await db.$transaction(async (tx) =>{
                fsx = await this.filesService.uploadFiles(files, BUCKET, user.profileId, objectId);

                if(!fsx){
                    set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
                    return { message: 'Unable to upload files'};
                }

                fsx.forEach( async(f:IFileUpload, i) => 
                    await tx.fileUpload.create({
                        data:{
                            origName: files[i].name,
                            fileName: f?.name,
                            fileType: f.type,
                            fileSize: f.size,
                            bucket: BUCKET,
                            key: f.name,
                            path: `/${BUCKET.toLowerCase()}/${f.name}`,
                            isPublic: false,
                            uploaderUserId: user.id,
                            metadata: JSON.stringify(fsx),
                            tags: ["file", mime.getExtension(f.type)!],
                            status: FileStatus.UPLOADED
                        }
                    })
                )
            })
           

            set.status = HttpStatusEnum.HTTP_201_CREATED;
            return { data: null, message: `files uploaded to ${BUCKET}` }
        } catch (error:any) {
            console.error("Upload failed: ", error);

            throw error;
        }
    }

    /** Upload a single image, not any other type */
    addSinglePhoto = async({ set, user, body: { file } }: any) => {
        const BUCKET = BucketType.PHOTOS;

        try {
            let uploadFile: FileUpload|null = null;
            let fsx:any;
            
            const upload = await db.$transaction(async (tx) =>{
                fsx = await this.filesService.uploadPhoto(file, BUCKET, user.id, file.name, true);

                if(!fsx){
                    set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
                    return { message: 'Unable to upload image'};
                }

                uploadFile = await tx.fileUpload.create({
                    data:{
                        origName: file.name,
                        fileName: fsx?.name,
                        fileType: fsx.type,
                        fileSize: fsx.size,
                        bucket: BUCKET,
                        key: fsx.name,
                        path: `/${BUCKET.toLowerCase()}/${fsx.name}`,
                        isPublic: false,
                        uploaderUserId: user.id,
                        metadata: JSON.stringify(fsx),
                        tags: ["photo", mime.getExtension(file.type)!],
                        status: FileStatus.UPLOADED
                    }
                })
            })
           

            set.status = HttpStatusEnum.HTTP_201_CREATED;
            return { data: uploadFile, message: fsx.existingFile ? 'Photo already exists' : 'Photo uploaded to '+BUCKET }
        } catch (error:any) {
            throw error;
            // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            // return { message: "Could not upload file" };
        }
    }

    /** Upload multiple image files */
    addMultiplePhotos = async({ set, user, body: { files, objectId } }: any) => {
        const BUCKET = BucketType.PHOTOS;
        
        try {
            await db.$transaction(async (tx) =>{
                const fsx: IImageUpload[]|null = await this.filesService.uploadPhotos(files, BUCKET, user.profileId, objectId, true);

                if(!fsx){
                    set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
                    return { message: 'Unable to upload images'};
                }

                fsx.forEach( async(f:any, i) => {
                    await tx.fileUpload.create({
                        data:{
                            origName: fsx[i].name,
                            fileName: f?.name,
                            fileType: f.type,
                            fileSize: f.size,
                            bucket: BUCKET,
                            key: f.name,
                            path: `/${BUCKET.toLowerCase()}/${f.name}`,
                            isPublic: false,
                            uploaderUserId: user.id,
                            metadata: JSON.stringify(fsx),
                            tags: ["photo", mime.getExtension(f.type)!],
                            status: FileStatus.UPLOADED
                        }
                    })
                })
            })
           

            set.status = HttpStatusEnum.HTTP_201_CREATED;
            return { data: null, message: 'Images uploaded to '+BUCKET }
        } catch (error:any) {
            console.error("Upload failed: ", error);

            throw error;
        }
    }

    addUserPhoto = async({ set, user, body: { file } }: any) => {
        const BUCKET = BucketType.USERS;
        let f: IImageUpload|null;

        try {
            await db.$transaction(async (tx) =>{
                f = await this.filesService.uploadPhoto(file, file.name, BUCKET, user.id);

                if(!f){
                    set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
                    return { message: 'Unable to upload User image'};
                }

                await tx.fileUpload.create({
                    data:{
                        origName: file.name,
                        fileName: f?.name,
                        fileType: f.type,
                        fileSize: f.size,
                        bucket: BUCKET,
                        key: f.name,
                        path: `/${BUCKET.toLowerCase()}/${f.name}`,
                        isPublic: false,
                        uploaderUserId: user.id,
                        metadata: JSON.stringify(f),
                        tags: ["file", mime.getExtension(file.type)!],
                        status: FileStatus.UPLOADED
                    }
                })
            })

            set.status = HttpStatusEnum.HTTP_201_CREATED;
            return { data: file.name, message: 'User Photo uploaded to '+BUCKET }
        } catch (error:any) {
            console.error("Upload failed: ", error);

            throw error;
        }
    }




    getAllPhotos = async ({ set }:any) => {
        const BUCKET = BucketType.PHOTOS;
        
        try {
            const images = await this.filesService.listAllFiles(BUCKET);
        
            set.status = 200;
            return { data: images, message: `Loaded ${this.getAllPhotos.length} photos`};
        } catch (error) {
            throw error;
        }
    }

    /** CRON function
     * used to keep db in sync with file storage
     */
    fileRecon = async() => {
        const BUCKET = BucketType.FILES;
        const dbFiles = await db.fileUpload.findMany();
  
        for (const file of dbFiles) {
            try {
                await minioClient.statObject(BucketType.FILES, file.key);
            } catch (error:any) {
                if (error.code === 'NotFound') {
                    // File exists in DB but not in MinIO
                    await db.fileUpload.update({
                    where: { id: file.id },
                    data: { status: FileStatus.MISSING_IN_STORAGE }
                    });
                }
            }
        }
    }


    checkAndMakeBucket = async({ query, set }:Context) => {
        const bucket = query.bucket;

        try {
            const bucketExisted: boolean = await this.filesService.pingBucketAndCreate(bucket as BucketType);

            set.status = bucketExisted ? 200 : HttpStatusEnum.HTTP_201_CREATED;
            return { message: bucketExisted ? `Bucket \'${bucket}\' already exists` : `Bucket \'${bucket}\' created` }
        } catch (error) {
            throw error;
        }
    }
}