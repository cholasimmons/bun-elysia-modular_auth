import { NotificationService } from ".";
import { ConnectionManager } from "./connectionsManager";
import { ElysiaWS } from "elysia/dist/ws";

export class NotificationController {
    private notificationService = NotificationService.instance;
    private manager = ConnectionManager.instance;
    // private usersService = new UsersService.instance;

    async handleWebSocketConnection(ws:ElysiaWS, userId: string) {
        try {
            // Step 1: Verify User's connections
            // let connId: string|null = await this.manager.getCachedConnection(userId)

            // // Step 2: If connection isn't present, generate new one
            // // let connId: string;
            // if(!connId) { connId = crypto.randomUUID(); }
            

            // console.log("CONN", connId);
            
            await this.manager.recoverSingleConnection(ws, userId);

            // Step 3: Add connection
            // await this.manager.addConnection(userId, connId);

            // Handle WebSocket lifecycle
            // ws.open("message", async (msg) => {
            //     console.log(`Message from ${connectionId}:`, msg.toString());
            // });

            // console.log(`Connection ${connectionId} closed`);
            // await this.notificationService.removeConnection(userId, connectionId);

        } catch(error) {
            throw error
        }
    }

    async handleWebSocketClose(connectionId: string) {
        try {
            // Step 1: Remove connection
            await this.manager.removeConnection(connectionId);

        } catch(error) {
            throw error
        }
    }

    /**
    * Handle new subscription requests (via WebSocket or API).
    */
    // async handleSubscribe(subscription: IWSConnection): Promise<void> {
    //     await this.notificationService.addSubscription(subscription);
    // }
    
    /**
    * Handle unsubscription (e.g., when WebSocket disconnects).
    */
    async handleUnsubscribe(connectionId: string): Promise<void> {
        await this.notificationService.removeSubscription(connectionId);
    }

    /**
    * Notify subscribed users about a category update.
    */
    // async notifySubscribers(category: string, message: string): Promise<void> {
    //     const subscribers = await redisKeys(`category:${category}`);
    //     for (const connectionId of subscribers) {
    //         const wsConnection = userConnections.get(connectionId); // Fetch WebSocket connection
    //         if (wsConnection) {
    //             wsConnection.send(JSON.stringify({ category, message }));
    //         }
    //     }
    // }

    root = async () => {
        await this.notificationService.manager.sendMessageToUser('6386', "We did it!!!");

        return { message: 'Get route \'/\' working.' }
    }
}