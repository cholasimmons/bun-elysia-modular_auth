// src/_queues/base.queue.ts
import { Queue, Worker } from 'bullmq';
import { redisConnection } from '../_config/redis';

export abstract class BaseQueue {
  protected queue: Queue;
  protected worker: Worker;

  constructor(queueName: string) {
    this.queue = new Queue(queueName, { connection: redisConnection });
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
      console.log(`${job.id}: ${job.name} has completed!`);
    });

    this.worker.on('failed', (job:any, err) => {
      console.log(`${job.id}: ${job.name} failed with ${err.message}`);
    });
  }

  // Add a job to the queue
  public add(name: string, data: any, options?: any) {
    return this.queue.add(name, data, options);
  }
}