import Elysia, { t } from "elysia";
import { checkAuth, checkForProfile, checkIsAdmin, checkIsStaff } from "~middleware/authChecks";
import { FileBodyDTO, FilesController } from '.';
import { swaggerDetails } from "~utils/response_helper";
import { paginationOptions } from "~modules/root/root.models";
import { ImageBodyDTO } from ".";
import { ImagesBodyDTO } from "./files.model";

const files = new FilesController();

export const FilesHandler = new Elysia({
    prefix: '/files',
    detail: { description: 'MinIO File Management endpoints', tags:[ 'Files' ] }
})

    .onBeforeHandle(checkAuth)

    .get('/', files.getAll, {
        beforeHandle: [checkIsStaff, checkIsAdmin],
        query: t.Object({
            ...paginationOptions
        }),
        response: {
            200: t.Union([
                t.Object({ data: t.Any(), message: t.String({ default: 'Loaded all files'}) }),
                t.Unknown()
            ])
        },
        detail: swaggerDetails('Get All Files')
    })

    .get('/:filename', files.getByFilename, {
        params: t.Object({ filename: t.String() }),
        response: {
            200: t.Object({ data: t.File(), message: t.String({ default: '"filename" loaded' }) }),
            404: t.Object({ message: t.String({ default: 'Could not load file' }) }),
        },
        detail: swaggerDetails('Get File by Name', 'Searches File Storage for filename')
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

    


    /* POST */


    .post('/upload/user', files.addUserPhoto, {
        beforeHandle: checkForProfile,
        body: ImageBodyDTO,
        detail: swaggerDetails('Upload User Photo', 'Do not use this endpoint manually')
    })
