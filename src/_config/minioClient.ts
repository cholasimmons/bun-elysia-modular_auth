import * as Minio from "minio"

const isProduction = Bun.env.NODE_ENV === 'production';

export const minioClient = new Minio.Client({
  endPoint: Bun.env.MINIO_HOST ?? '127.0.0.1',
  port: Number(Bun.env.MINIO_PORT ?? 9000),
  accessKey: Bun.env.MINIO_ROOT_USER ?? '',
  secretKey: Bun.env.MINIO_ROOT_PASSWORD ?? '',
  useSSL: Boolean(isProduction)
})
