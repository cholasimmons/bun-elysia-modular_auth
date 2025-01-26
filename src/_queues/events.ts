import { Coupon, Message, Profile, User, WalletTransaction } from "@prisma/client";
import { emailQueue } from "src/_queues/queues";
import { redisMessagingService } from "~config/redis";

// System events for testing
const initializeTestEventListeners = () => {
    redisMessagingService.subscribe("system-events", (message) => {
      const event = JSON.parse(message);
      // const system = event?.data;
  
      if (event.action === "start") {
          console.log(`Index page accessed`);
      }
    });
};

// User module events
const initializeUserEventListeners = () => {
  redisMessagingService.subscribe("user", (message) => {
    const event = JSON.parse(message);
    const user = event.user as Partial<User | Profile>;

    if (event.action === "user:register") {
        console.debug(`[EVENT] New user registered: ${user.firstname} ${user.lastname}`);
        // Run user registration logic

        emailQueue.add('user:register', user, {
          attempts: 5, // Retry
          backoff: { type: "exponential", delay: 1000 } // Exponential backoff
      });
    }
  
    if (event.action === "user:login") {
        console.debug(`[EVENT] User logged in: ${user.email}`);

        emailQueue.add('user:login', user, {
            attempts: 5, // Retry
            backoff: { type: "exponential", delay: 1000 } // Exponential backoff
        });
    }

    if (event.action === "user:delete") {
      console.log(`User deleted: ${user.id}`);
      // Run user deletion logic
    }

    if (event.action === "user:new-profile") {
      console.log(`User ${user.firstname} created a profile`);
  }
  });
};


// Wallet module events
const initializeWalletEventListeners = () => {
  redisMessagingService.subscribe("wallet-events", (message) => {
    const event = JSON.parse(message);
    const transaction = event.transaction as Partial<WalletTransaction>;

    if (event.action === "paid") {
      console.log(`${transaction.payerProfileId} paid ${transaction.payeeProfileId} ${transaction.amount}`);
    }

    if (event.action === "wallet_funded") {
      console.log(`Wallet funded for user ${event.userId}: ${event.amount}`);
      // Update wallet balance or process transactions
    }
  });
};

// Coupon module events
const initializeCouponEventListeners = () => {
  redisMessagingService.subscribe("coupon-events", (message) => {
    const event = JSON.parse(message);
    const coupon = event.coupon as Partial<Coupon>;

    switch (event.action) {
      case "coupon_used":
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
  redisMessagingService.subscribe("message-events", (message) => {
    const event = JSON.parse(message);
    const msg = event.message as Partial<Message>;

    switch (event.action) {
      case "sent":
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
