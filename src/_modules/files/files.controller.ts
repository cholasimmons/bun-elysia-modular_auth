import { HttpStatusEnum } from "elysia-http-status-code/status";
import { FilesService } from ".";
import mime from "mime";
import { BucketType, IImageUpload } from "./files.model";
import { db, prismaSearch } from "~config/prisma";
import { minioClient } from "~config/minioClient";
import { FileStatus } from "@prisma/client";

export class FilesController {
    private filesService: FilesService;

    constructor(){
        this.filesService = new FilesService();
    }

    getByFilename = async({ set, params: { filename } }: any) => {

        try {
            console.log('Fetching: ',filename);
            
            const file: Blob = await this.filesService.getFileByName(filename, BucketType.PRODUCT);


            set.headers['Content-Type'] = 'image/*';
            return { data: file, message: `${filename} loaded` }
            // return file
        } catch (error) {
            console.error(error);
            set.status = HttpStatusEnum.HTTP_404_NOT_FOUND
            return { message: 'Could not load file' }
        }
        
    }

    getFilesByUserId = async({ set, user, params, query }: any) => {
        // const { page, limit, orderBy, search, include } = query;
        const user_id = params?.userId ?? user.id ?? null;
        try {
            // await prismaSearch();
            const file: Blob = await this.filesService.listAllImages(BucketType.PRODUCT);

            // set.headers['Content-Type'] = 'image/*';
            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: file, message: 'User\'s files loaded' }
            // return file
        } catch (error) {
            console.error(error);
            set.status = HttpStatusEnum.HTTP_404_NOT_FOUND
            return { message: 'Could not load file' }
        }
        
    }

    addSinglePhoto = async({ set, user, body: { file, objectId } }: any) => {
        
        try {
            await db.$transaction(async (tx) =>{
                const fsx: IImageUpload|null = await this.filesService.uploadPhoto(file, BucketType.PRODUCT, user.profileId, objectId);

                if(!fsx){
                    set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
                    return { message: 'Unable to upload image'};
                }

                await tx.fileUpload.create({
                    data:{
                        origname: file.name,
                        name: fsx?.name,
                        type: fsx.type,
                        size: fsx.size,
                        bucket: BucketType.PRODUCT,
                        path: `/${BucketType.PRODUCT.toLowerCase()}/${fsx.name}`,
                        userProfileId: user.profileId,
                        status: FileStatus.UPLOADED
                    }
                })
            })
           

            set.status = HttpStatusEnum.HTTP_201_CREATED;
            return { data: null, message: 'Files uploaded to '+BucketType.PRODUCT }
        } catch (error:any) {
            console.error("Upload failed: ", error);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return { message: "Could not upload file" };
        }
    }

    addMultiplePhotos = async({ set, user, body: { files, objectId } }: any) => {
        
        try {
            await db.$transaction(async (tx) =>{
                const fsx: IImageUpload[]|null = await this.filesService.uploadPhotos(files, BucketType.PRODUCT, user.profileId, objectId);

                if(!fsx){
                    set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
                    return { message: 'Unable to upload image'};
                }

                fsx.forEach( async(f:any, i) => {
                    await tx.fileUpload.create({
                        data:{
                            origname: fsx[i].name,
                            name: f.name,
                            type: f.type,
                            size: f.size,
                            bucket: BucketType.PRODUCT,
                            path: `/${BucketType.PRODUCT.toLowerCase()}/${f.name}`,
                            userProfileId: user.profileId,
                            status: FileStatus.UPLOADED
                        }
                    })
                })
            })
           

            set.status = HttpStatusEnum.HTTP_201_CREATED;
            return { data: null, message: 'Files uploaded to '+BucketType.PRODUCT }
        } catch (error:any) {
            console.error("Upload failed: ", error);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return { message: "Could not upload file" };
        }
    }

    addUserPhoto = async({ set, user, body: { file } }: any) => {
        let f: IImageUpload|null;

        try {
            await db.$transaction(async (tx) =>{
                f = await this.filesService.uploadPhoto(file, file.name, BucketType.USER, user.profileId);

                if(!f){
                    set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
                    return { message: 'Unable to upload User image'};
                }

                await tx.fileUpload.create({
                    data:{
                        origname: file.name,
                        name: f.name,
                        type: f.type,
                        size: f.size,
                        bucket: BucketType.USER,
                        path: `/${BucketType.USER.toLowerCase()}/${f.name}`,
                        userProfileId: user.profileId,
                        status: FileStatus.UPLOADED
                    }
                })
            })

            set.status = HttpStatusEnum.HTTP_201_CREATED;
            return { data: file.name, message: 'Photo uploaded to '+BucketType.USER }
        } catch (error:any) {
            console.error("Upload failed: ", error);

            if(f!){
                await db.fileUpload.create({
                    data: {
                        origname: file.name,
                        name: f.name,
                        type: f.type,
                        size: f.size,
                        bucket: BucketType.USER,
                        path: `/${BucketType.USER.toLowerCase()}/${f.name}`,
                        userProfileId: user.profileId,
                        status: FileStatus.UPLOAD_FAILED,
                        comment: error.message
                    }
                });
            }

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return { message: "Could not upload photo" };
        }
    }


    getAll = async() => {
        console.log('[File Controller]...');
        
        const l = await this.filesService.listAllImages(BucketType.PRODUCT);
        
        return { data: l, message: 'Loaded all files'};
    }

    /** CRON function
     * used to keep db in sync with file storage
     */
    fileRecon = async() => {
        const dbFiles = await db.fileUpload.findMany();
  
        for (const file of dbFiles) {
            try {
            await minioClient.statObject(this.filesService.fetchBucketName(BucketType.PRODUCT), file.name);
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
}