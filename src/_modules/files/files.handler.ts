import Elysia, { t } from "elysia";
import { checkAuth, checkForProfile, checkIsAdmin, checkIsStaff } from "~middleware/authChecks";
import { FileBodyDTO, FilesController, FilesService } from '.';
import { swaggerDetails } from "~utils/response_helper";
import { paginationOptions } from "~modules/root/root.models";
import { ImageBodyDTO } from ".";
import { BucketType, FilesBodyDTO, ImagesBodyDTO } from "./files.model";

const filesService = new FilesService();
const files = new FilesController(filesService);

export const FilesHandler = new Elysia({
    prefix: '/files',
    detail: { description: 'File Management endpoints', tags:[ 'Files' ] }
})

    // REQUIRED
    // .onBeforeHandle(checkAuth)

    .get('/file', files.getAllFiles, {
        //beforeHandle: [checkIsStaff || checkIsAdmin],
        query: t.Object({
            ...paginationOptions
        }),
        response: {
            200: t.Object({ data: t.Any(), message: t.String({ default: 'Loaded all files'}) })
        },
        detail: swaggerDetails('Get All Files')
    })

    .get('/file/user', files.getFilesByUserId, {
        // beforeHandle: [checkIsStaff || checkIsAdmin],
        query: t.Object({
            ...paginationOptions
        }),
        response: {
            200: t.Object({ data: t.Any(), message: t.String({ default: 'Loaded all User\'s files'}) })
        },
        detail: swaggerDetails('Get All User\'s Files')
    })

    .get('/file/user/:userId', files.getFilesByUserId, {
        beforeHandle: [checkIsStaff || checkIsAdmin],
        params: t.Object({ userId: t.String() }),
        query: t.Object({
            ...paginationOptions
        }),
        response: {
            200: t.Object({ data: t.Any(), message: t.String({ default: 'Loaded all User\'s files'}) })
        },
        detail: swaggerDetails('Get All User\'s Files')
    })

    .get('/photo', files.getAllPhotos, {
        // beforeHandle: [checkIsStaff || checkIsAdmin],
        query: t.Object({
            ...paginationOptions
        }),
        response: {
            200: t.Object({ data: t.Array(t.String()), message: t.String({ default: 'Loaded all photos'}) })
        },
        detail: swaggerDetails('Get All Photos')
    })

    .get('/file/:filename', files.getByFilename, {
        params: t.Object({ filename: t.String() }),
        response: {
            200: t.Object({ data: t.File(), message: t.String({ default: 'File loaded' }) }),
            404: t.Object({ message: t.String({ default: 'Could not load file' }) }),
        },
        detail: swaggerDetails('Get File by Name', 'Searches File Storage for filename')
    })

    .get('/photo/:filename', files.getByPhotoname, {
        params: t.Object({ filename: t.String() }),
        response: {
            200: t.Object({ data: t.File(), message: t.String({ default: 'Photo loaded' }) }),
            404: t.Object({ message: t.String({ default: 'Could not load photo' }) }),
        },
        detail: swaggerDetails('Get Photo by filename', 'Searches Photo Storage for filename')
    })

    // .get('/:userId', files.getFilesByUserId, {
    //     params: t.Object({ userId: t.String() }),
    //     query: t.Object({  }),
    //     response: {
    //         200: t.Object({ data: t.Array(t.MaybeEmpty(t.File())), message: t.String({ default: 'files found: 0' }) }),
    //         404: t.Object({ message: t.String({ default: 'Could not load files' }) }),
    //     },
    //     detail: swaggerDetails('Get All Files by UserID')
    // })

    .get('/file/ping', files.checkAndMakeBucket, {
        query: t.Object({ bucket: t.String(t.Enum(BucketType)) }) ,
        //beforeHandle: [checkIsStaff || checkIsAdmin],
        response: {
            200: t.Object({ message: t.String({ default: 'Bucket created'}) }),
            500: t.Any()
        },
        detail: swaggerDetails('Check Bucket | create')
    })

    .get('/', ()=>"Files OK")


    /* POST */


    .post('/upload/photo', files.addSinglePhoto, {
        // beforeHandle: checkForProfile,
        body: ImageBodyDTO,
        detail: swaggerDetails('Upload a Photo', 'Used for testing S3 storage')
    })
    .post('/upload/photos', files.addMultiplePhotos, {
        // beforeHandle: checkForProfile,
        body: ImagesBodyDTO,
        detail: swaggerDetails('Upload multiple Photos', 'Used for testing S3 storage')
    })

    .post('/upload/file', files.addSingleFile, {
        // beforeHandle: checkForProfile,
        body: FileBodyDTO,
        detail: swaggerDetails('Upload a File', 'Used for testing S3 storage')
    })
    .post('/upload/files', files.addMultipleFiles, {
        // beforeHandle: checkForProfile,
        body: FilesBodyDTO,
        detail: swaggerDetails('Upload multiple Files', 'Used for testing S3 storage')
    })

    .post('/upload/user', files.addUserPhoto, {
        // beforeHandle: checkForProfile,
        body: ImageBodyDTO,
        detail: swaggerDetails('Upload User Photo', 'Do not use this endpoint manually')
    })

    .all('/', ({ set }) => { return { message: "Route does not exist"} })