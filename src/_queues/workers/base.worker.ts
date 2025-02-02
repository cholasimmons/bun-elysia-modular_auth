// src/_queues/workers/base.worker.ts
import { Job, Queue, Worker, WorkerOptions } from 'bullmq';
import { redisConnection } from '~config/redis';

export abstract class BaseWorker {
  protected worker: Worker;

  constructor(queueName: string) {
    this.worker = new Worker(queueName, this.processJob.bind(this), {
      connection: redisConnection,
      concurrency: 2,
    });

    this.setupListeners();
  }

  // Abstract method to process jobs (must be implemented by child classes)
  protected abstract processJob(job: any): Promise<void>;

  // Common listener setup
  private setupListeners() {
    this.worker.on('completed', (job) => {
        if(!job) return;
      console.log(`${job.id}: ${job.name} has completed!`);
    });

    this.worker.on('failed', (job, err) => {
        if(!job) return;
      console.log(`${job.id}: ${job.name} failed with ${err.message}`);
    });
  }
}