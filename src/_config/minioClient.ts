import { S3Client } from "bun";
import * as Minio from "minio"

const isProduction = Bun.env.NODE_ENV === 'production';

export const minioClient = new Minio.Client({
  endPoint: Bun.env.MINIO_HOST ?? '127.0.0.1',
  port: Number(Bun.env.MINIO_PORT) ?? 9000,
  accessKey: Bun.env.MINIO_ACCESS_KEY ?? '',
  secretKey: Bun.env.MINIO_SECRET_KEY ?? '',
  useSSL: Boolean(isProduction),
  region: Bun.env.MINIO_REGION
})


const s3 = new S3Client({
  accessKeyId: Bun.env.MINIO_ACCESS_KEY ?? '',
  secretAccessKey: Bun.env.MINIO_SECRET_KEY ?? '',
  region: Bun.env.MINIO_REGION ?? "auto",
  endpoint: Bun.env.MINIO_HOST ?? '127.0.0.1' ?? "https://<account-id>.r2.cloudflarestorage.com",
  bucket: Bun.env.BUCKET_FILES,
})