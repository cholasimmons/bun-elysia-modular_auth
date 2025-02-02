// src/_queues/file.queue.ts
import { BaseQueue } from './base.queue';
import { FileUpload } from '@prisma/client';

export class FileQueue extends BaseQueue {
  constructor() {
    super('fileQueue');
  }

  protected async processJob(job: any) {
    const file: FileUpload | any = job.data;

    switch (job.name) {
      case 'file:upload':
        console.log("[BullMQ Worker] ", file.name, " file uploaded");
        break;

      case 'file:photo:upload':
        console.log("[BullMQ Worker] ", file.name, " photo uploaded");
        break;

      default:
        break;
    }

    // Simulate async task
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}