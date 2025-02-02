// src/_queues/email.queue.ts
import { BaseQueue } from './base.queue';
import { SafeUser } from '~modules/users/users.model';
import { email } from '~modules/messages/smtp';
import { AuthService } from '~modules/auth/auth.service';
import { EmailWorker } from './workers/email.worker';
import { RedisEvents } from '~config/constants';

export class EmailQueue extends BaseQueue {

  constructor(private authService: AuthService) {
    super('emailQueue');
    new EmailWorker(authService);
  }

  protected async processJob(job: any) {
    const user: SafeUser | null = job.data;

    switch (job.name) {
      case RedisEvents.USER_LOGIN:
        await email.sendMail({
          from: '"Elysia" <mail@hello.simmons.studio>',
          to: 'user@elysia.com',
          subject: 'Welcome to the family',
          html: '<b>A Cool text message</b><br>This is an <em>awesome</em> feature!<br>...for someone who just joined.',
        });
        console.log("[BullMQ Worker] ", user!.email, " logged in");
        break;

      case RedisEvents.USER_REGISTER:
        const verificationCode = await this.authService.generateEmailVerificationCode(user!.id, user!.email);
        await email.sendMail({
          from: '"Elysia" <mail@hello.simmons.studio>',
          to: 'user@elysia.com',
          subject: 'Welcome to the family',
          html: `<h3>${verificationCode}</h3><br>
          Use this code to activate your account<br>
          Thanks for testing the app!`,
        });
        console.log(`[BullMQ Worker] Verification code sent to ${user!.email}`);
        break;
      case RedisEvents.USER_LOGOUT:
        console.log(`[BullMQ Email Worker] User logged out`);
        break// BullMQ event queue

      default:
        break;
    }

    // Simulate async task
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}