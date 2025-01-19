import Redis from "ioredis";
import { redisConnection } from "../_config/redis";
import { Queue, Worker } from "bullmq";
import { SafeUser } from "~modules/users/users.model";
import { AuthService } from "~modules/index";
import { FileUpload } from "@prisma/client";


// Services
const authService = AuthService.getInstance();


// Queues

/** Requires SafeUser */
const emailQueue = new Queue('emailQueue', { connection: redisConnection });
const fileQueue = new Queue('fileQueue', { connection: redisConnection });



// Workers

const emailWorker = new Worker('emailQueue', async (job) => {
    const user: SafeUser = job.data;

    switch (job.name) {
        case "user:login":
            console.log("[BullMQ Worker] ", user.email, " logged in");
            break;
        
        case "user:create":
            const verificationCode = await authService.generateEmailVerificationCode(user.id, user.email);
	        await authService.sendEmailVerificationCode(user.email, verificationCode);
            
            console.log(`Verification code sent to ${user.email}`);

            console.log("[BullMQ Worker] User registered", user.id);
            break;
        
        case "user:logout":
            console.log("[BullMQ Worker] User has logged out", user); // Shows ID not User object
            break;
    
        default:
            break;
    }
      
        // Perform some async task
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }, { connection: redisConnection, concurrency: 2 }
);
const fileWorker = new Worker('fileQueue', async (job) => {
    const file: FileUpload|any = job.data;

    switch (job.name) {
        case "file:photo:upload":
            console.log("[BullMQ Worker] ", file, " uploaded");
            break;

        default:
            break;
    }
      
        // Perform some async task
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }, { connection: redisConnection, concurrency: 2 }
);


// Listeners

emailWorker.on('completed', (job) => {
    const { id, name } = job;

    console.log(`${id}: ${name} has completed!`);
});
emailWorker.on('failed', (job:any, err) => {
    const { id, name } = job;

    console.log(`${job.id}: ${job.name} failed with ${err.message}`);
});

fileWorker.on('failed', (job:any, err) => {
    const { id, name } = job;

    console.log(`${job.id}: ${job.name} failed with ${err.message}`);
});


const queueOptions = (delaySeconds = 10, attempts = 5, priority = 5) => { return {
    delay: delaySeconds * 1000,
    attempts: attempts,
    backoff: { delay: 2000, type: 'exponential'},
    priority: priority
}}

export { emailQueue, fileQueue, queueOptions }