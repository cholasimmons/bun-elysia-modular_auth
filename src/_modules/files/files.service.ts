import sharp, { AvailableFormatInfo, FormatEnum } from "sharp";
import { minioClient } from "~config/minioClient";
import { getFile, getFiles, storeBuffer } from "~modules/files/minio.controller";
import { BucketType, IImageUpload, UploadMode } from "./files.model";
import mime from "mime";
import { BunFile } from "bun";
import { dateToFilename } from "~utils/utilities";
import consts from "~config/consts";
import { BadRequestError, ConflictError, NotFoundError, ThirdPartyServiceError } from "~exceptions/custom_errors";
import { db } from "~config/prisma";
import { FileStatus } from "@prisma/client";
import { fileQueue, queueOptions } from "src/_queues/queues";


const BUCKET_FILES: string = Bun.env.BUCKET_FILES || 'hello-files';
const WATERMARK_SQUARE: BunFile = Bun.file('./public/images/logos/elysia_icon.webp');

const imageFormat: keyof FormatEnum | AvailableFormatInfo = 'webp';
const imageMainQuality: number = Number(Bun.env.IMAGE_QUALITY) ?? 75;
const imageThumbQuality: number = Number(Bun.env.THUMBNAIL_QUALITY) ?? 40;

export class FilesService {

    // Check if selected bucket exists
    pingBucket = async(bucket: BucketType): Promise<boolean> => {
        try {
            // console.log(`checking bucket ${this.fetchBucketName(bucket)}...`);
            let bucketExists = await minioClient.bucketExists(bucket);

            if(bucketExists){
                return true;
            } else {
                return false;
            }
        } catch (error) {
            throw error;;
        }
    }

    // Check if selected bucket exists, if not then create it
    pingBucketAndCreate = async(bucket: BucketType): Promise<boolean> => {
        try {
            const bucketName = bucket.toString();
            
            const bucketExists:boolean = await minioClient.bucketExists(bucketName);
            
            // If bucket doesn't exist, create it
            if(!bucketExists){
                await minioClient.makeBucket(bucketName, Bun.env.MINIO_REGION);
            } else {
                return true;
            }

            return bucketExists;
        } catch (error) {
            throw error;
        }
    }


    // GENERIC: files

    listAllFiles = async(bucket: BucketType) => {
        try {
            const allFiles:any = await getFiles(bucket);

            // for (let index = 0; index < 2; index++) {
            //     const element = res[index];
                
            //     console.log(element);
            // }
            
            return allFiles;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    getFileByName = async(filename: string, bucket: BucketType) => {
        try {
            const res = await getFile(filename, bucket);

            if(!res) throw `${filename} not found`;
            
            return res;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    getFilesByUserId = async(userId: string) => {
        const BUCKET = BUCKET_FILES;
        try {
            // const res = await getFile(filename, BucketType.FILES);
            const dbFiles = await db.fileUpload.findMany({
                where: { uploaderUserId: userId, status: FileStatus.UPLOADED }
            });

            if(!dbFiles) throw new NotFoundError('Files not found');
            
            return dbFiles;
        } catch (error) {
            console.error(error);

            throw error;
        }
    }

    uploadFile = async (file: File, fileName: string, bucket: BucketType, uploaderUserId: string) => {
        const createdDate = new Date();
        const bucketName: string = bucket;

        try {
            // Get the file extension from the MIME type
            const fileExtension = mime.getExtension(file.type) || '';

            // Convert file to buffer
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Calculate the file hash (e.g., SHA-256)
            const fileHash = new Bun.CryptoHasher('sha256').update(arrayBuffer).digest('hex');

            // Generate unique file names or IDs
            const uniqueFileName = `${createdDate.getTime()}${fileExtension ? '.'+fileExtension : ''}`;

            const metadata = {
                name: file.name,
                size: file.size,
                type: file.type,
                'X-Amz-Meta-UploaderUserId': uploaderUserId,
                'X-Amz-Meta-CreatedDate': createdDate.toISOString(),
                hash: fileHash
            };

            // Check if the file hash already exists in the database
            const existingFile = await db.fileUpload.findFirst({ where: { hash: fileHash} });
            if (existingFile) {
                console.log('File already exists:', existingFile);
                // throw new ConflictError("File already exists");
                return { ...metadata, name: uniqueFileName }
            }

            await storeBuffer(buffer, bucketName, {...metadata, name: uniqueFileName});

            await fileQueue.add('file:upload', file, queueOptions(2, 3, 2));

            return {...metadata, name: uniqueFileName, existingFile: existingFile };
        } catch (error:any) {
            throw error;
        }
    }

    uploadFiles = async (files: File[], fileName: string, bucket: BucketType, userProfileId: string) => {
        const createdDate = new Date();
        const bucketName: string = bucket;

        try {
            // Process and upload each image
            const processedFiles = await Promise.all(files.map(async (file, index) => {
                const metadata = { name: file.name, size: file.size, type: file.type, 'X-Amz-Meta-UploaderUserId': userProfileId, 'X-Amz-Meta-CreatedDate': createdDate.toISOString() };

                // Convert file to buffer
                const arrayBuffer = await file.arrayBuffer();

                // Get the file extension from the MIME type
                const fileExtension = mime.getExtension(file.type) || '';
                const uniqueFileName = `${fileName}_${createdDate.getTime()}_${index}${fileExtension ? '.'+fileExtension : ''}`;
                
                // Calculate the file hash (e.g., SHA-256)
                const fileHash = new Bun.CryptoHasher('sha256').update(arrayBuffer).digest('hex');

                // Check if the file hash already exists in the database
                const existingFile = await db.fileUpload.findFirst({ where: { hash: fileHash} });
                if (existingFile) {
                    console.log('File already exists:', existingFile);
                    return { ...metadata, name: uniqueFileName};
                    // throw new ConflictError("File already exists");
                    //     existingFile,
                    //     message: 'File already uploaded',
                    // };
                }

                const buffer = Buffer.from(arrayBuffer);

                // Upload files to MinIO
                await storeBuffer(buffer, bucketName, { ...metadata, name: uniqueFileName });

                await fileQueue.add('file:upload', file, queueOptions(2, 3, 2));

                return { ...metadata, name: uniqueFileName, existingFile: existingFile }
            }));

            return processedFiles;
            
        } catch (error:any) {
            console.error(error);
            throw 'Could not process uploads';
        }

    }


    // GENERIC: images


    uploadPhoto = async (file: File, bucket: BucketType, userId: string, fileName?: string, hasWatermark?: boolean, hasBlur?: boolean) => {

        const bucketName:string = bucket; //this.fetchBucketName(bucket);

        // Get the file extension from the MIME type
        const fileExtension = imageFormat as string // mime.getExtension(file.type) || '';
        const createdDate = new Date();

        const generatedName = fileName ? fileName?.toWellFormed() : dateToFilename(createdDate);
        let uniqueFileName = `${generatedName}_${createdDate.getTime()}${fileExtension ? '.'+fileExtension : ''}`;

        try {

            const metadata: IImageUpload = { name: file.name, size: file.size, type: file.type, 'X-Amz-Meta-UploaderUserId': userId, 'X-Amz-Meta-CreatedDate': createdDate.toISOString() };

            // If file type isn't of an image, return
            if(!file.type.startsWith("image")){
                throw new BadRequestError('File is not an image');
            }
            
            // Process the image (resize, format, etc.)
            const arrayBuffer = await file.arrayBuffer();

            // Calculate the file hash (e.g., SHA-256)
            const fileHash = new Bun.CryptoHasher('sha256').update(arrayBuffer).digest('hex');

            // Check if the file hash already exists in the database
            const existingFile = await db.fileUpload.findFirst({ where: { hash: fileHash} });
            if (existingFile) {
                console.log('File already exists:', existingFile);
                return { ...metadata, name: uniqueFileName, existingFile:true};
            }
            
            // Load the watermark SVG
            const wmarrbuff = await WATERMARK_SQUARE.arrayBuffer();            
            const watermarkBuffer = Buffer.from(wmarrbuff);

            const resizedBuffer = await sharp(arrayBuffer)
                // .composite([{ input: watermarkBuffer, gravity: 'southeast', blend: "over" }]) // Adjust gravity as needed
                .resize(consts.images.main.width || 1280, consts.images.main.height || 1280)
                .toFormat(imageFormat, {quality: imageMainQuality || consts.images.main.quality || 78})
                .toBuffer()
            
            let finalBuffer = resizedBuffer;
            if(hasWatermark){
                finalBuffer = await sharp(resizedBuffer)
                .composite([{ input: watermarkBuffer, gravity: 'southeast' }])
                // .ensureAlpha(0.3)
                .toBuffer()
            }

            // Blur a copy of the main image. Used for "Free Users"
            let blurBuffer: Buffer = resizedBuffer;
            if(hasBlur){
                blurBuffer = await sharp(blurBuffer).blur(consts.images.blurAmount || 9).toFormat(imageFormat, {quality: imageMainQuality || consts.images.main.quality || 78}).toBuffer();
            }

            // Creates thumbnail version of main watermarked image
            const thumbImage = await sharp(finalBuffer)
                .resize(consts.images.thumbnail.width || 196, consts.images.thumbnail.height || 196)
                .toFormat(imageFormat, {quality: imageThumbQuality || consts.images.thumbnail.quality || 48})
                .toBuffer();
            // Upload images to MinIO
            await Promise.all([
                storeBuffer(finalBuffer, bucketName, { ...metadata, name: 'main_'+uniqueFileName, 'X-Amz-Meta-Mode': UploadMode.MAIN}),
                (hasBlur) ? storeBuffer(blurBuffer, bucketName, { ...metadata, name: 'blur_'+uniqueFileName, 'X-Amz-Meta-Mode': UploadMode.BLUR }) : null ,
                storeBuffer(thumbImage, bucketName, { ...metadata, name: 'thumb_'+uniqueFileName, 'X-Amz-Meta-Mode': UploadMode.THUMB }),
            ])

            await fileQueue.add('file:photo:upload', file, queueOptions(2, 3, 2));

            return { ...metadata, name: uniqueFileName, existingFile: existingFile};
        } catch (error:any) {
            console.error(error);
            
            throw error;
        }
    }

    uploadPhotos = async (files: File[], bucket: BucketType, userProfileId: string, fileName?: string, hasWatermark?: boolean, hasBlur?:boolean) => {
        const createdDate = new Date();
        const bucketName = bucket; // this.fetchBucketName(bucket);
        const generatedName = fileName ? fileName?.toWellFormed() : dateToFilename(createdDate);
        

        try {
            // Get the file extension from the MIME type
            const fileExtension = imageFormat as string // mime.getExtension(file.type) || '';

            // Load the watermark SVG
            const wmarkbuff = await WATERMARK_SQUARE.arrayBuffer();
            const watermarkBuffer = Buffer.from(wmarkbuff);

            // Process and upload each image
            const processedImages = await Promise.all(files.map(async (file, index) => {
                const metadata = { name: file.name, size: file.size, type: file.type, 'X-Amz-Meta-UploaderUserId': userProfileId, 'X-Amz-Meta-CreatedDate': createdDate.toISOString() };
                const arrayBuffer = await file.arrayBuffer();

                // Calculate the file hash (e.g., SHA-256)
                const fileHash = new Bun.CryptoHasher('sha256').update(arrayBuffer).digest('hex');

                // Generate unique file names or IDs
                const uniqueFileName = `${generatedName}_${createdDate.getTime()}_${index}${fileExtension ? '.'+fileExtension : ''}`;

                // Check if the file hash already exists in the database
                const existingFile = await db.fileUpload.findFirst({ where: { hash: fileHash} });
                if (existingFile) {
                    console.log('File already exists:', existingFile);
                    return { ...metadata, name: uniqueFileName };
                    // return {
                    //     existingFile,
                    //     message: 'File already uploaded',
                    // };
                }

                // Convert photo into buffer data
                const mainImage = await sharp(arrayBuffer)
                    .resize(consts.images.main.width || 1280, consts.images.main.height || 1280)
                    .toFormat(imageFormat, {quality: imageMainQuality || consts.images.main.quality || 78})
                    .toBuffer()
                
                // Composite the watermark over the main image
                let finalBuffer: Buffer = mainImage;
                    if(hasWatermark){
                        finalBuffer = await sharp(finalBuffer)
                        .composite([{ input: watermarkBuffer, gravity: 'southeast', blend: 'over' }])
                        // .ensureAlpha(0.3)
                        .toBuffer()
                    }
                
                // Blur a copy of the main image. Used for "Free Users"
                let blurBuffer: Buffer = mainImage;
                if(hasBlur){
                    blurBuffer = await sharp(blurBuffer).resize(consts.images.main.width || 640, consts.images.main.height || 640).blur(consts.images.blurAmount).toFormat(imageFormat, {quality: imageMainQuality}).toBuffer();
                }

                // Creates thumbnail version of main watermarked image
                const thumbImage = await sharp(finalBuffer)
                    .resize(consts.images.thumbnail.width || 196, consts.images.thumbnail.height || 196)
                    .toFormat(imageFormat, {quality: imageThumbQuality || consts.images.thumbnail.quality || 48})
                    .toBuffer();

                // Upload images to MinIO
                await Promise.all([
                    storeBuffer(mainImage, bucketName, { ...metadata, name: 'main_'+uniqueFileName, 'X-Amz-Meta-Mode': UploadMode.MAIN }),
                    (hasBlur) ? storeBuffer(blurBuffer, bucketName, { ...metadata, name: 'blur_'+uniqueFileName, 'X-Amz-Meta-Mode': UploadMode.BLUR }) : null ,
                    storeBuffer(thumbImage, bucketName, { ...metadata, name: 'thumb_'+uniqueFileName, 'X-Amz-Meta-Mode': UploadMode.THUMB }),
                ]);

                await fileQueue.add('file:photo:upload', file, queueOptions(2, 3, 2));

                return { ...metadata, name: uniqueFileName };
            }));

            console.debug(processedImages);
            return processedImages;
            
        } catch (error:any) {
            console.error(error);
            throw 'Could not process uploads';
        }
    }
}