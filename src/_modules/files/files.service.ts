import sharp, { AvailableFormatInfo, FormatEnum } from "sharp";
import { minioClient } from "~config/minioClient";
import { getFile, getFiles, storeBuffer } from "~modules/files/minio.controller";
import { BucketType } from "./files.model";
import mime from "mime";
import { BunFile } from "bun";
import { dateToFilename } from "~utils/utilities";
import consts from "~config/consts";

const USER_PHOTOS: string = Bun.env.BUCKET_USERPHOTOS || 'users';
const PRODUCT_PHOTOS: string = Bun.env.BUCKET_PRODUCTPHOTOS || 'products';
const WATERMARK_SQUARE: BunFile = Bun.file('./public/images/logos/elysia_icon.webp');

const imageFormat: keyof FormatEnum | AvailableFormatInfo = 'webp';
const imageMainQuality: number = Number(Bun.env.IMAGE_QUALITY);
const imageThumbQuality: number = Number(Bun.env.THUMBNAIL_QUALITY);
export class FilesService {

    fetchBucketName(bucket: BucketType): string{
        switch (bucket) {
            case BucketType.USER:
                return USER_PHOTOS.toLowerCase();
            case BucketType.PRODUCT:
                return PRODUCT_PHOTOS.toLowerCase()
        }
    }

    // Check if selected bucket exists
    pingBucket = async(bucket: BucketType): Promise<boolean> => {
        try {
            // console.log(`checking bucket ${this.fetchBucketName(bucket)}...`);
            let bucketExists = await minioClient.bucketExists(this.fetchBucketName(bucket));

            if(bucketExists){
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }

    // Check if selected bucket exists, if not then create it
    pingBucketAndCreate = async(bucket: BucketType): Promise<boolean> => {
        const bucketName = this.fetchBucketName(bucket);
        try {
            // console.log(`checking bucket ${this.fetchBucketName(bucket)}...`);
            let bucketExists = await minioClient.bucketExists(bucketName);

            // If bucket doesn't exist, create it
            if(!bucketExists){
                await minioClient.makeBucket(bucketName);
            } else {
                return true;
            }

            // bucketExists = await minioClient.bucketExists(this.fetchBucketName(bucket));
            
            return bucketExists;
        } catch (error) {
            return false;
        }
    }


    // GENERIC: files

    listAllImages = async(bucket: BucketType) => {
        try {
            const allFiles:any = await getFiles(this.fetchBucketName(bucket));

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
            const res = await getFile(filename, this.fetchBucketName(bucket));

            if(!res) throw `${filename} not found`;
            
            return res;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    uploadFile = async (file: File, fileName: string, bucket: BucketType, userProfileId: string) => {
        const createdDate = new Date();
        const bucketName = this.fetchBucketName(bucket);

        try {
            // Get the file extension from the MIME type
            const fileExtension = mime.getExtension(file.type) || '';

            // Generate unique file names or IDs
            const uniqueFileName = `${fileName}_${createdDate.getTime()}${fileExtension ? '.'+fileExtension : ''}`;

            const metadata = { name: file.name, size: file.size, type: file.type, 'X-Amz-Meta-UserProfileId': userProfileId, 'X-Amz-Meta-CreatedDate': createdDate.toISOString() };

            // Convert file to buffer
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            await storeBuffer(buffer, bucketName, {...metadata, name: uniqueFileName})

            return {...metadata, name: uniqueFileName};
        } catch (error:any) {
            console.error(error);
            throw error;
        }
    }

    uploadFiles = async (files: File[], fileName: string, bucket: BucketType, userProfileId: string) => {
        const createdDate = new Date();
        const bucketName = this.fetchBucketName(bucket);

        try {
            // Process and upload each image
            const processedFiles = await Promise.all(files.map(async (file, index) => {
                const metadata = { name: file.name, size: file.size, type: file.type, 'X-Amz-Meta-UserProfileId': userProfileId, 'X-Amz-Meta-CreatedDate': createdDate.toISOString() };

                // Get the file extension from the MIME type
                const fileExtension = mime.getExtension(file.type) || '';
                const uniqueFileName = `${fileName}_${createdDate.getTime()}_${index}${fileExtension ? '.'+fileExtension : ''}`;
                
                // Convert file to buffer
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // Upload files to MinIO
                await storeBuffer(buffer, bucketName, { ...metadata, name: uniqueFileName })

                return { ...metadata, name: uniqueFileName }
            }));

            return processedFiles;
            
        } catch (error:any) {
            console.error(error);
            throw 'Could not process uploads';
        }

    }


    // GENERIC: images


    uploadPhoto = async (file: File, bucket: BucketType, userProfileId: string, fileName?: string, hasWatermark?: boolean, hasBlur?: boolean) => {
        const bucketName:string = this.fetchBucketName(bucket);
        // Get the file extension from the MIME type
        const fileExtension = imageFormat as string // mime.getExtension(file.type) || '';
        const createdDate = new Date();

        const generatedName = fileName ? fileName?.toWellFormed() : dateToFilename(createdDate);
        let uniqueFileName: string = generatedName+'.'+fileExtension;
        uniqueFileName = `${generatedName}_${createdDate.getTime()}${fileExtension ? '.'+fileExtension : ''}`;

        try {
            // const exists: BucketItemStat = await minioClient.statObject(bucketName, uniqueFileName);
            // console.debug(exists);
            

            // // Generate unique file name if filename exists
            // if(exists.etag){
            //     uniqueFileName = `${generatedName}_${createdDate.getTime()}${fileExtension ? '.'+fileExtension : ''}`;
            // }

            const metadata = { name: file.name, size: file.size, type: file.type, 'X-Amz-Meta-UserProfileId': userProfileId, 'X-Amz-Meta-CreatedDate': createdDate.toISOString() };

            // If file type isn't of an image, return
            if(!file.type.startsWith("image")){
                throw 'File is not an image';
            }

            // Load the watermark SVG
            const wmarrbuff = await WATERMARK_SQUARE.arrayBuffer();            
            const watermarkBuffer = Buffer.from(wmarrbuff);
            
            // Process the image (resize, format, etc.)
            const arraybuffer = await file.arrayBuffer();
            const resizedBuffer = await sharp(arraybuffer)
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
                storeBuffer(finalBuffer, bucketName, { ...metadata, name: 'main_'+uniqueFileName}),
                (hasBlur) ? storeBuffer(blurBuffer, bucketName, { ...metadata, name: 'blur_'+uniqueFileName }) : null ,
                storeBuffer(thumbImage, bucketName, { ...metadata, name: 'thumb_'+uniqueFileName }),
            ])
            

            return { ...metadata, name: uniqueFileName};
        } catch (error:any) {
            console.error(error);
            
            throw error;
        }
    }

    uploadPhotos = async (files: File[], bucket: BucketType, userProfileId: string, fileName?: string, hasWatermark?: boolean, hasBlur?:boolean) => {
        const createdDate = new Date();
        const bucketName = this.fetchBucketName(bucket);
        const generatedName = fileName ? fileName?.toWellFormed() : dateToFilename(createdDate);

        try {
            // Get the file extension from the MIME type
            const fileExtension = imageFormat as string // mime.getExtension(file.type) || '';

            

            // Load the watermark SVG
            const wmarkbuff = await WATERMARK_SQUARE.arrayBuffer();
            const watermarkBuffer = Buffer.from(wmarkbuff);

            // Process and upload each image
            const processedImages = await Promise.all(files.map(async (file, index) => {
                const metadata = { name: file.name, size: file.size, type: file.type, 'X-Amz-Meta-UserProfileId': userProfileId, 'X-Amz-Meta-CreatedDate': createdDate.toISOString() };
                const arraybuffer = await file.arrayBuffer();

                // Convert photo into buffer data
                const mainImage = await sharp(arraybuffer)
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

                // Generate unique file names or IDs
                const uniqueFileName = `${generatedName}_${createdDate.getTime()}_${index}${fileExtension ? '.'+fileExtension : ''}`;

                // Upload images to MinIO
                await Promise.all([
                    storeBuffer(mainImage, bucketName, { ...metadata, name: 'main_'+uniqueFileName }),
                    (hasBlur) ? storeBuffer(blurBuffer, bucketName, { ...metadata, name: 'blur_'+uniqueFileName }) : null ,
                    storeBuffer(thumbImage, bucketName, { ...metadata, name: 'thumb_'+uniqueFileName }),
                ]);

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