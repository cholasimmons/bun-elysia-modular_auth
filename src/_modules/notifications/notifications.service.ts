import { db } from "~config/prisma";
import { Message, WSConnections } from "@prisma/client";
import { redisDel, redisExists, redisGet, redisGetAll, redisKeys, redisSet } from "~config/redis";
import { ConnectionManager } from "./connectionsManager";

export class NotificationService {
    private static _instance: NotificationService;

    public manager: ConnectionManager;

    constructor(){
        console.info("NotificationService is GO");
        
        this.manager = ConnectionManager.instance;
    }

    public static get instance():NotificationService {
        if(!NotificationService._instance){
            NotificationService._instance = new NotificationService()
        }
        return NotificationService._instance
    }


    /**
   * Add a subscription (both to Redis and the DB for persistence).
   */
//   async addSubscription(subscription: IWSConnection): Promise<void> {
//     const { userId, categories, connectionId } = subscription;

//     // Save to Redis
//     for (const category of categories) {
//       await redisSet(`category:${category}`, connectionId);
//     }

//     // Save to DB (replace with your ORM/query)
//     await db.wSConnections.upsert({
//         where: { userId },
//         update: {},
//         create: { userId, categories, connectionId },
//         });
//     }

    /**
   * Remove a subscription.
   */
    async removeSubscription(connectionId: string): Promise<void> {
        // Remove from Redis
        const categories = await this.getSubscribedCategories(connectionId);
        for (const category of categories) {
            await redisDel(`category:${category}`);
        }

        // Remove from DB (based on connectionId)
        await db.wSConnections.deleteMany({ where: { connectionId } });
    }


    /**
   * Get subscribed categories for a connectionId.
   */
    async getSubscribedCategories(connectionId: string): Promise<string[]> {
        const categories: string[] = [];
        const allKeys = await redisKeys('category:*');
        for (const key of allKeys) {
        const isSubscribed = await redisExists(key, connectionId);
        if (isSubscribed) categories.push(key.replace('category:', ''));
        }
        return categories;
    }
}