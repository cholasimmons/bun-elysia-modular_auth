// src/_queues/workers/email.worker.ts
import { BaseWorker } from './base.worker';
import { SafeUser } from '../../_modules/users/users.model';
import { email } from '../../_modules/messages/smtp';
import { AuthService } from '../../_modules/auth/auth.service';
import { RedisEvents } from '~config/constants';

export class EmailWorker extends BaseWorker {
  private authService: AuthService;

  constructor(authService: AuthService) {
    super('emailQueue');
    this.authService = authService;
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
        // TODO: Implement messaging service
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

      default:
        break;
    }

    // Simulate async task
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}