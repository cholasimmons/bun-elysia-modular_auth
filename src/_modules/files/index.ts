import Elysia, { t } from "elysia";
import { checkIsAdmin, checkIsStaff } from "~middleware/authChecks";
import { FilesService } from "./files.service";
import { swaggerDetails } from "~utils/response_helper";
import { Pagination } from "~modules/root/root.models";
import {
  BucketType,
  FilesBodyDTO,
  ImagesBodyDTO,
  ImageBodyDTO,
  IFileUpload,
  FileBodyDTO,
  IImageUpload,
} from "./files.model";
import { FileUploadPlain } from "@generated/prismabox/FileUpload";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { FileUpload } from "@generated/prisma/client";
import { db } from "~config/prisma";
import { FileStatus } from "@generated/prismabox/FileStatus";
import mime from "mime";
import { fileQueue, queueOptions } from "~queues/queues";

export const FilesHandler = new Elysia({
  prefix: "/files",
  detail: { description: "File Management endpoints", tags: ["Files"] },
})

  // REQUIRED
  // .onBeforeHandle(checkAuth)

  .get(
    "/file",
    async ({ status, set }) => {
      const BUCKET = BucketType.FILES;
      console.log("[File Controller]...");

      try {
        const files = await FilesService.listAllFiles(BUCKET);

        return status(200, { data: files, message: "Loaded all files" });
      } catch (error) {
        throw error;
      }
    },
    {
      //beforeHandle: [checkIsStaff || checkIsAdmin],
      query: Pagination.options,
      response: {
        200: t.Object({
          data: t.Array(FileUploadPlain),
          message: t.String({ default: "Loaded all files" }),
        }),
      },
      detail: swaggerDetails("Get All Files"),
    },
  )

  .get(
    "/file/user",
    async ({ status, set, user, params, query }: any) => {
      // const { page, limit, orderBy, search, include } = query;
      const user_id = params?.userId ?? user.id ?? null;
      try {
        // await prismaSearch();
        const files = await FilesService.getFilesByUserId(user_id);

        // set.headers['Content-Type'] = 'image/*';
        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: files,
          message: `${files.length} User\'s files loaded`,
        });
        // return file
      } catch (error) {
        console.error(error);

        throw error;
      }
    },
    {
      // beforeHandle: [checkIsStaff || checkIsAdmin],
      query: Pagination.options,
      params: t.Object({ userId: t.Optional(t.String()) }),
      response: {
        200: t.Object({
          data: t.Array(FileUploadPlain),
          message: t.String({ default: "Loaded all User's files" }),
        }),
      },
      detail: swaggerDetails("Get All User's Files"),
    },
  )

  .get(
    "/file/user/:userId",
    async ({ status, set, user, params, query }: any) => {
      // const { page, limit, orderBy, search, include } = query;
      const user_id = params?.userId ?? user.id ?? null;
      try {
        // await prismaSearch();
        const files = await FilesService.getFilesByUserId(user_id);

        // set.headers['Content-Type'] = 'image/*';
        // set.status = HttpStatusEnum.HTTP_200_OK;
        return status(200, {
          data: files,
          message: `${files.length} User\'s files loaded`,
        });
        // return file
      } catch (error) {
        console.error(error);

        throw error;
      }
    },
    {
      beforeHandle: [checkIsStaff || checkIsAdmin],
      params: t.Object({ userId: t.String() }),
      query: Pagination.options,
      response: {
        200: t.Object({
          data: t.Array(FileUploadPlain),
          message: t.String({ default: "Loaded all User's files" }),
        }),
      },
      detail: swaggerDetails("Get All User's Files"),
    },
  )

  .get(
    "/photo",
    async ({ status, set }) => {
      const BUCKET = BucketType.PHOTOS;

      try {
        const images = await FilesService.listAllFiles(BUCKET);

        return status(200, {
          data: images,
          message: `Loaded ${images.length} photos`,
        });
      } catch (error) {
        throw error;
      }
    },
    {
      // beforeHandle: [checkIsStaff || checkIsAdmin],
      query: Pagination.options,
      response: {
        200: t.Object({
          data: t.Array(t.String()),
          message: t.String({ default: "Loaded all photos" }),
        }),
      },
      detail: swaggerDetails("Get All Photos"),
    },
  )

  .get(
    "/file/:filename",
    async ({ status, set, params: { filename } }) => {
      const BUCKET = BucketType.FILES;

      try {
        console.log(`Fetching ${BUCKET}: ${filename}`);

        const file: Blob = await FilesService.getFileByName(filename, BUCKET);

        set.headers["Content-Type"] = "file/*";
        return status(200, { data: file, message: "File loaded" });
        // return file
      } catch (error) {
        console.error(error);

        throw error;
      }
    },
    {
      params: t.Object({ filename: t.String() }),
      response: {
        200: t.Object({
          data: t.Any(),
          message: t.String({ default: "File loaded" }),
        }),
        404: t.Object({
          message: t.String({ default: "Could not load file" }),
        }),
      },
      detail: swaggerDetails(
        "Get File by Name",
        "Searches File Storage for filename",
      ),
    },
  )

  .get(
    "/photo/:filename",
    async ({ status, set, params: { filename } }) => {
      const BUCKET = BucketType.PHOTOS;

      try {
        console.log(`Fetching ${BUCKET}: ${filename}`);

        const file: Blob = await FilesService.getFileByName(filename, BUCKET);

        set.headers["Content-Type"] = "image/*";
        return status(200, { data: file, message: "Image loaded" });
      } catch (error) {
        console.error(error);

        throw error;
      }
    },
    {
      params: t.Object({ filename: t.String() }),
      response: {
        200: t.Object({
          data: t.Any(),
          message: t.String({ default: "Photo loaded" }),
        }),
        404: t.Object({
          message: t.String({ default: "Could not load photo" }),
        }),
      },
      detail: swaggerDetails(
        "Get Photo by filename",
        "Searches Photo Storage for filename",
      ),
    },
  )

  // .get('/:userId', files.getFilesByUserId, {
  //     params: t.Object({ userId: t.String() }),
  //     query: t.Object({  }),
  //     response: {
  //         200: t.Object({ data: t.Array(t.MaybeEmpty(t.File())), message: t.String({ default: 'files found: 0' }) }),
  //         404: t.Object({ message: t.String({ default: 'Could not load files' }) }),
  //     },
  //     detail: swaggerDetails('Get All Files by UserID')
  // })

  .get(
    "/file/ping",
    async ({ status, query, set }) => {
      const bucket = query.bucket;

      try {
        const bucketExisted: boolean = await FilesService.pingBucketAndCreate(
          bucket as BucketType,
        );

        // set.status = bucketExisted ? 200 : HttpStatusEnum.HTTP_201_CREATED;
        return status(bucketExisted ? 200 : 201, {
          message: bucketExisted
            ? `Bucket \'${bucket}\' already exists`
            : `Bucket \'${bucket}\' created`,
        });
      } catch (error) {
        throw error;
      }
    },
    {
      query: t.Object({ bucket: t.String(t.Enum(BucketType)) }),
      //beforeHandle: [checkIsStaff || checkIsAdmin],
      response: {
        200: t.Object({
          message: t.String({ default: "Bucket already exists" }),
        }),
        201: t.Object({ message: t.String({ default: "Bucket created" }) }),
        500: t.Any(),
      },
      detail: swaggerDetails("Check Bucket | create"),
    },
  )

  .get("/", "Files OK")

  /* POST */

  .post(
    "/upload/photo",
    async ({ status, set, user, body: { file } }: any) => {
      const BUCKET = BucketType.PHOTOS;

      try {
        let uploadFile: FileUpload | null = null;
        let fsx: any;

        const upload = await db.$transaction(async (tx) => {
          fsx = await FilesService.uploadPhoto(
            file,
            BUCKET,
            user.id,
            file.name,
            true,
          );

          if (!fsx) {
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: "Unable to upload image" };
          }

          uploadFile = await tx.fileUpload.create({
            data: {
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
              status: FileStatus.UPLOADED,
            },
          });
        });

        // set.status = HttpStatusEnum.HTTP_201_CREATED;
        return status(201, {
          data: uploadFile,
          message: fsx.existingFile
            ? "Photo already exists"
            : "Photo uploaded to " + BUCKET,
        });
      } catch (error: any) {
        throw error;
        // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
        // return { message: "Could not upload file" };
      }
    },
    {
      // beforeHandle: checkForProfile,
      body: ImageBodyDTO,
      detail: swaggerDetails("Upload a Photo", "Used for testing S3 storage"),
    },
  )

  .post(
    "/upload/photos",
    async ({ status, set, user, body: { files, objectId } }: any) => {
      const BUCKET = BucketType.FILES;

      try {
        let fsx: IFileUpload[] | null = null;
        let logs: FileUpload[] | null = null;

        await db.$transaction(async (tx) => {
          fsx = await FilesService.uploadFiles(
            files,
            objectId,
            BUCKET,
            user.profileId,
          );

          if (!fsx) {
            // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return status(500, { message: "Unable to upload files" });
          }

          fsx.forEach(
            async (f: IFileUpload, i) =>
              await tx.fileUpload.create({
                data: {
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
                  status: FileStatus.UPLOADED,
                },
              }),
          );
        });

        // set.status = HttpStatusEnum.HTTP_201_CREATED;
        return status(201, {
          data: null,
          message: `files uploaded to ${BUCKET}`,
        });
      } catch (error: any) {
        console.error("Upload failed: ", error);

        throw error;
      }
    },
    {
      // beforeHandle: checkForProfile,
      body: ImagesBodyDTO,
      detail: swaggerDetails(
        "Upload multiple Photos",
        "Used for testing S3 storage",
      ),
    },
  )

  .post(
    "/upload/file",
    async ({ status, set, user, body: { file } }: any) => {
      const BUCKET: BucketType = BucketType.FILES;

      try {
        const upload = await db.$transaction(async (tx) => {
          const fsx: IFileUpload | null = await FilesService.uploadFile(
            file,
            BUCKET,
            user.id,
            file.name,
          );

          if (!fsx) {
            // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return status(500, { message: "Unable to upload file" });
          }

          const uploaded = await tx.fileUpload.create({
            data: {
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
              status: FileStatus.UPLOADED,
            },
          });

          fileQueue.add("file:upload", uploaded, queueOptions());
        });

        // set.status = HttpStatusEnum.HTTP_201_CREATED;
        return status(201, {
          data: upload,
          message: `${mime.getExtension(file.type)} uploaded to ${BUCKET}`,
        });
      } catch (error: any) {
        throw error;
      }
    },
    {
      // beforeHandle: checkForProfile,
      body: FileBodyDTO,
      detail: swaggerDetails("Upload a File", "Used for testing S3 storage"),
    },
  )

  .post(
    "/upload/files",
    async ({ status, set, user, body: { files, objectId } }: any) => {
      const BUCKET = BucketType.FILES;

      try {
        let fsx: IFileUpload[] | null = null;
        let logs: FileUpload[] | null = null;

        await db.$transaction(async (tx) => {
          fsx = await FilesService.uploadFiles(
            files,
            objectId,
            BUCKET,
            user.profileId,
          );

          if (!fsx) {
            // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return status(500, { message: "Unable to upload files" });
          }

          fsx.forEach(
            async (f: IFileUpload, i) =>
              await tx.fileUpload.create({
                data: {
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
                  status: FileStatus.UPLOADED,
                },
              }),
          );
        });

        // set.status = HttpStatusEnum.HTTP_201_CREATED;
        return status(201, {
          data: null,
          message: `files uploaded to ${BUCKET}`,
        });
      } catch (error: any) {
        console.error("Upload failed: ", error);

        throw error;
      }
    },
    {
      // beforeHandle: checkForProfile,
      body: FilesBodyDTO,
      detail: swaggerDetails(
        "Upload multiple Files",
        "Used for testing S3 storage",
      ),
    },
  )

  .post(
    "/upload/user",
    async ({ status, set, user, body: { file } }: any) => {
      const BUCKET = BucketType.USERS;
      let f: IImageUpload | null;

      try {
        await db.$transaction(async (tx) => {
          f = await FilesService.uploadPhoto(file, BUCKET, user.id, file.name);

          if (!f) {
            // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR
            return status(500, { message: "Unable to upload User image" });
          }

          await tx.fileUpload.create({
            data: {
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
              status: FileStatus.UPLOADED,
            },
          });
        });

        // set.status = HttpStatusEnum.HTTP_201_CREATED;
        return status(201, {
          data: file.name,
          message: "User Photo uploaded to " + BUCKET,
        });
      } catch (error: any) {
        console.error("Upload failed: ", error);

        throw error;
      }
    },
    {
      // beforeHandle: checkForProfile,
      body: ImageBodyDTO,
      detail: swaggerDetails(
        "Upload User Photo",
        "Do not use this endpoint manually",
      ),
    },
  )

  .all("/", ({ set }) => {
    return { message: "Route does not exist" };
  });
