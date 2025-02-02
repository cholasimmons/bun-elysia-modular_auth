import { Coupon, Message, Profile, User, WalletTransaction } from "@prisma/client";
import { emailQueue, queueOptions } from "~queues/queues";
import { RedisEvents } from "~config/constants";
import { redisMessagingService } from "~config/redis";
import { SafeUser } from "~modules/users/users.model";

// System events for testing
const initializeTestEventListeners = () => {
    redisMessagingService.subscribe(RedisEvents.SYSTEM, (message) => {
      const event = JSON.parse(message);
      const system = event?.data;
  
      if (event.action === RedisEvents.SYSTEM_START) {
          console.log(`Index page accessed`, system);
      }
    });
};

// User module events
const initializeUserEventListeners = () => {
  redisMessagingService.subscribe("user", (message) => {
    const event = JSON.parse(message);
    const user = event.user as Partial<SafeUser | Profile>;

    if (event.action === RedisEvents.USER_REGISTER) {
        console.debug(`[EVENT] New user registered: ${user.firstname} ${user.lastname}`);
        // Run user registration logic

        // BullMQ event queue
        emailQueue.add(event.action, user, queueOptions(5, 10, 1));
    }
  
    if (event.action === RedisEvents.USER_LOGIN) {
        console.debug(`[EVENT] User logged in: ${user.email}`);

        // BullMQ job queue
        emailQueue.add(event.action, user, queueOptions());
    }

    if (event.action === RedisEvents.USER_LOGOUT) {
      // BullMQ event queue
      emailQueue.add(RedisEvents.USER_LOGOUT, null);
    }

    if (event.action === RedisEvents.USER_DELETE) {
      console.log(`User deleted: ${user.id}`);
      // Run user deletion logic
    }

    if (event.action === RedisEvents.USER_NEW_PROFILE) {
      console.log(`User ${user.firstname} created a profile`);
  }
  });
};


// Wallet module events
const initializeWalletEventListeners = () => {
  redisMessagingService.subscribe(RedisEvents.WALLET, (message) => {
    const event = JSON.parse(message);
    const transaction = event.transaction as Partial<WalletTransaction>;

    if (event.action === RedisEvents.WALLET_PAID) {
      console.log(`${transaction.payerProfileId} paid ${transaction.payeeProfileId} ${transaction.amount}`);
    }

    if (event.action === RedisEvents.WALLET_FUNDED) {
      console.log(`Wallet funded for user ${event.userId}: ${event.amount}`);
      // Update wallet balance or process transactions
    }
  });
};

// Coupon module events
const initializeCouponEventListeners = () => {
  redisMessagingService.subscribe(RedisEvents.COUPON, (message) => {
    const event = JSON.parse(message);
    const coupon = event.coupon as Partial<Coupon>;

    switch (event.action) {
      case RedisEvents.COUPON_USED:
        console.log(`Coupon ${coupon.name} used`);
        break;
    
      default:
        console.log(`Coupon event accessed`);
        break;
    }
  });
};

// Messaging module events
const initializeMessagingEventListeners = () => {
  redisMessagingService.subscribe(RedisEvents.MESSAGE, (message) => {
    const event = JSON.parse(message);
    const msg = event.message as Partial<Message>;

    switch (event.action) {
      case RedisEvents.MESSAGE_SENT:
        // Notify recipient
        console.debug(`[Event] New [${msg.deliveryMethods}] message from ${msg.senderId}: ${msg.title}`);
        break;
    
      default:
        break;
    }
  });
};

// Centralized listener initialization
export const initializeEventListeners = () => {
  console.log("Initializing event listeners (Redis)...");
  initializeTestEventListeners();
  initializeUserEventListeners();
  initializeWalletEventListeners();
  initializeCouponEventListeners();
  initializeMessagingEventListeners();
};
