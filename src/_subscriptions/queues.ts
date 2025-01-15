import Redis from "ioredis";
import { redisConnection } from "../_config/redis";
import { Queue, Worker } from "bullmq";


// Queues

const emailQueue = new Queue('emailQueue', { connection: redisConnection });



// Workers

const emailWorker = new Worker('emailQueue', async (job) => {
    switch (job.name) {
        case "user_logged-in":
            console.log("[BullMQ Worker] User logged in",job.data);
            break;
        case "user_registered":
            console.log("[BullMQ Worker] User registered",job.data);
            break;
    
        default:
            break;
    }
      

        // Perform some async task
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(`Job completed: ${job.id}`);
    }, { connection: redisConnection },
);


// Listeners

emailWorker.on('completed', (job) => {
    console.log(`${job.id}:${job.name} has completed!`);
});
emailWorker.on('failed', (job:any, err) => {
    console.log(`${job.id}:${job.name} has failed with ${err.message}`);
});


export { emailQueue }