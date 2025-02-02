import { WSConnections } from "@prisma/client";
import { ElysiaWS } from "elysia/dist/ws";
import { constants } from "~config/constants";
import { db } from "~config/prisma";
import { redisDel, redisGet, redisGetAll, redisKeys, redisSet } from "~config/redis";

export class ConnectionManager {
    private static _instance: ConnectionManager;

    private userConnections = new Map<string, string>(); // userId -> connectionId
    private connectionToUser = new Map<string, string>(); // connectionId -> userId
    private connections = new Map<string, ElysiaWS>(); // connectionId -> WebSocket

    private redisKeyPrefix = "userConnections";

    private constructor() {
        console.info("|| WebSocket Manager is GO");
        
    }

    public static get instance(): ConnectionManager {
        if (!ConnectionManager._instance) {
            ConnectionManager._instance = new ConnectionManager();
        }
        return ConnectionManager._instance;
    }

    
    async addConnection(ws:ElysiaWS, userId: string, connectionId?: string) {
        console.info(`addConnection(${userId}, ${connectionId})`);

        let connId = connectionId ?? crypto.randomUUID();

        // Update in-memory map
        this.userConnections.set(userId, connId);
        this.connectionToUser.set(connId, userId);
        this.connections.set(connId, ws);

        // Persist connection and categories in Redis
        await redisSet(`${this.redisKeyPrefix}:${userId}`, connId);

        console.log("Added connection of User",userId, connId);
        
        ws.send({ message: `Welcome to ${constants.server.name} ${userId}`, data: connId})
    }

    async removeConnection(connectionId: string): Promise<void> {
        console.info(`removeConnection(${connectionId})`);
        // Find the userId corresponding to the given connectionId
        // const userId = [...this.userConnections.entries()]
        // .find(([, value]) => value === connectionId)?.[0];
        // Retrieve the userId from the reverse map
        const userId = this.connectionToUser.get(connectionId);

        if (!userId) {
            console.warn(`Connection ID ${connectionId} not found in userConnections reverse map.`);
            return;
        }
        
        // Remove the connection from both in-memory maps
        this.userConnections.delete(userId);
        this.connectionToUser.delete(connectionId);

        // Remove from Redis
        await redisDel(`${this.redisKeyPrefix}:${userId}`);
    }

    // Recover a connection on startup
    async recoverSingleConnection(ws:ElysiaWS, userId: string) {
        console.info(`recoverSingleConnection(${userId})`);

        // Fetch cached connection IDs per userID
        const connectionId: string|null = await this.getCachedConnection(userId);

        console.log("RecoverSingleConnection ID", connectionId);

        if(connectionId) {
            this.userConnections.set(userId, connectionId);
            this.connectionToUser.set(connectionId, userId);
            this.connections.set(connectionId, ws);

            ws.send({ message: `Welcome back ${userId}`, data: connectionId})
        } else {
            await this.addConnection(ws, userId);
            return
        }

        
    }

    // Recover connections on startup
    async recoverConnections() {
        const allUserKeys = await redisKeys(`${this.redisKeyPrefix}:*`);

        console.log("RecoverConnections. Keys", allUserKeys);
        

        for (const userKey of allUserKeys) {
            const userId = userKey.split(":")[1];

            // Fetch cached connection IDs per userID
            const connectionId: string|null = await this.getCachedConnection(userId);

            if(!connectionId) return;
            console.log(`RedisGetAll connection ID:, ${connectionId}`);

            this.userConnections.set(userId, connectionId);
            this.connectionToUser.set(connectionId, userId);
        }
    }

    /**
     * Get connectionId by userId
     */
    getConnectionId(userId: string): string | undefined {
        return this.userConnections.get(userId);
    }

    /**
     * Get userId by connectionId
     */
    getUserId(connectionId: string): string | undefined {
        return this.connectionToUser.get(connectionId);
    }

    // Retrieve websocket connection by UserID
    getConnectionByUserId(userId: string): ElysiaWS | null {
        const connectionId = this.userConnections.get(userId);
        return connectionId ? this.connections.get(connectionId) || null : null;
    }

    // Broadcast notification
    async broadcastToCategory(category: string, message: string) {
        for (const [userId, connections] of this.userConnections.entries()) {
            for (const connectionId of connections) {
                const categories = await this.getCategories(userId, connectionId);
                if (categories?.includes(category)) {
                    // Send message to WebSocket (to be implemented in Controller)
                    this.sendMessageToUser(userId, message);
                }
            }
        }
    }

    // Fetch categories for a connection
    async getCategories(userId: string, connectionId: string): Promise<string[] | null> {
        const data = await redisGet<string>(`${this.redisKeyPrefix}:${userId}`);
        return data ? JSON.parse(data).categories : null;
    }

    async sendMessageToUser(userId: string, message: any) {
        const socket:ElysiaWS|null = this.getConnectionByUserId(userId);
        
        if (socket) {
            socket.send(JSON.stringify(message));
        } else {
            console.log(`User ${userId} is not connected.`);
        }
    }


    
    /** Cron job to sync cache with database
     * @interval 60000 (60 seconds)
     */
    async syncDatabaseWithCache(): Promise<number> {
        // Recover connection ID's from database
        const connections = await db.wSConnections.findMany({
            select: { userId: true, connectionId: true }
        });
        
        // Iterate each item to populate cache
        for(const connection of connections){
            const { userId, connectionId} = connection;

            await redisSet(`${this.redisKeyPrefix}:${userId}`, connectionId)
        }

        return connections.length;
    }
    
    /** Cron job to sync cache with database
     * @interval 60000 (60 seconds)
     */
    async syncCacheWithDatabase(): Promise<number> {
        const keys = await redisKeys(`${this.redisKeyPrefix}:*`);
        console.debug(keys.length, "Keys found", keys);
        
        for (const key of keys) {
            //const userId = key.split(":")[1];
            const userId = key.replace(`${this.redisKeyPrefix}:`, "");
            const connectionId = await redisGet<string>(key);
            console.debug("Connection ID found", connectionId);

            if(!connectionId || !userId) break;
    
            // Write the connection data to the database
            await db.wSConnections.upsert({
                where: { userId },
                create: { userId, connectionId },
                update: { userId, connectionId }    
            });
        }

        return keys.length;
    }



    /** Get web socket connections from cache/database, by UserID
     * @param userId
     * 
     */
    async getCachedConnection(userId: string):Promise<string|null>{
        let connection: string|null = await redisGet(`${this.redisKeyPrefix}:${userId}`);

        if(!connection){
            const dbConn: WSConnections|null = await db.wSConnections.findFirst({
                where: { userId }
            });

            // if(!db) throw new NotFoundError('Socket Connection data not found', 404, 'Connection data not present in cache/database');
            if(dbConn){
                connection = dbConn.connectionId;
                await redisSet(`${this.redisKeyPrefix}:${userId}`, connection)
            };
        }

        return connection!;
    }
}