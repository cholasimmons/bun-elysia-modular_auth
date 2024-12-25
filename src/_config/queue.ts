import Redis from "ioredis";
import { redisConnection } from "./redis";
import { Queue, Worker } from "bullmq";


// Queue

const queue = new Queue('transactionQueue', { connection: redisConnection });

// Add a job to the queue
await queue.add('processPayment', {
    userId: 123,
    amount: 100.0,
}, {
    attempts: 3, // Retry up to 3 times
    backoff: { type: "exponential", delay: 3000 } // Exponential backoff
});



// Worker    




const worker = new Worker(
    'foo',
    async job => {
      // Will print { foo: 'bar'} for the first job
      // and { qux: 'baz' } for the second.
      console.log(job.data);
    },
    { connection: redisConnection },
);

worker.on('completed', job => {
    console.log(`${job.id} has completed!`);
});
  
worker.on('failed', (job:any, err) => {
    console.log(`${job.id} has failed with ${err.message}`);
});