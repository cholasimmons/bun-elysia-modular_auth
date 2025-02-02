// src/_queues/queues.ts
import { EmailQueue } from './email.queue';
import { FileQueue } from './file.queue';
import { AuthService } from '../_modules/auth/auth.service';

let authServiceInstance: AuthService|null = null; // Placeholder for injected service

export function setAuthService(service: AuthService) {
  authServiceInstance = service;
}

// Initialize services
const authService = AuthService.instance;

// Initialize queues
const emailQueue = new EmailQueue(authService);
const fileQueue = new FileQueue();

// Export queues and options
const queueOptions = (delaySeconds:number = 10, attempts:number = 5, priority:number = 5) => ({
  delay: delaySeconds * 1000,
  attempts: attempts,
  backoff: { delay: 2000, type: 'exponential' },
  priority: priority,
});

export { emailQueue, fileQueue, queueOptions };