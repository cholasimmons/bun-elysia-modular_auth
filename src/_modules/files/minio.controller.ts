import { randomUUID } from "crypto"
import { Readable, Stream } from "stream"
import { minioClient } from "~config/minioClient"

/*** Returns bucket name + file name as string */
export const storeFile = async (file: File, bucket: string, filePath:string, metadata?: any) => {
  try {
    const fileArrayBuffer = await file.arrayBuffer()
    const meta = { name: file.name, size: file.size, type: file.type }
    const put = await minioClient.fPutObject(
      bucket,
      file.name,
      filePath,
      metadata ?? meta
    )
    return `${bucket}/${file.name}`;
  } catch (error) {
    console.error('Unable to store S3 buffer');
    throw error
  }
}

/*** Returns bucket name + file name as string */
export const storeBuffer = async (buffer: Buffer|Readable, bucket: string, meta?:{ name:string, size:number, type: string}) => {
  try {
    const filename = meta?.name ?? randomUUID()+'.webp';

    const put = await minioClient.putObject(
      bucket,
      filename,
      buffer,
      meta?.size,
      meta
    )
    console.log(`${filename} saved successfully.`);
    
    // return {name: filename, size: meta?.size, type: meta?.type }
    // return filename;
    return `/${bucket}/${filename}`;
  } catch (error) {
    console.error('Unable to store S3 buffer');
    throw error
  }
}

const readStream = (dataStream: any) =>
  new Promise((resolve, reject) => {
    const buffer: any[] = []
    dataStream.on("data", (chunk: any) => {
      buffer.push(chunk)
    })
    dataStream.on("end", () => {
      resolve(buffer)
    })
    dataStream.on("error", (err: any) => {
      reject(err)
    })
  })

export const getFile = async (filename: string, bucket: string) => {
  const dataStream: Readable = await minioClient.getObject(bucket, filename)
  const buffer: any = await readStream(dataStream)
  return new Blob(buffer)
}


export const getFiles = async (bucket: string):Promise<string[]> => new Promise((resolve, reject) => {
    const objects: string[] = [];

    const datastream = minioClient.listObjects(bucket, undefined, true);
    
    datastream.on('data', (obj:any) => {
      objects.push(obj.name);
    });

    datastream.on('end', () => {
      resolve(objects);
    });

    datastream.on('error', (err) => {
      console.error(err);
      
      reject('Unable to retrieve S3 files');
    });
  });
