import Redis from "ioredis";

const _host = Bun.env.NODE_ENV === 'production' ? (String(Bun.env.REDIS_HOST) || '127.0.0.1') : '127.0.0.1'
const _port = Number(Bun.env.REDIS_PORT) || 6379;

const cache = new Redis({
    host: _host,
    port: _port,
    maxRetriesPerRequest: null
});

/*** Returns JSON parsed data */
export const redisGet = async <T>(key: string): Promise<T | null> => {
    const data = await cache.get(key);
    return data ? JSON.parse(data) : null;
};

/*** Returns true/false depending on success or failure of retriving data of that key
 ** lifespan: minutes
 */
export const redisSet = async (key: string, data: any, lifespan:number = 5): Promise<boolean> => {
    return (await cache.setex(key, lifespan*60, JSON.stringify(data))) === 'OK';
};

// Auth


/*** Add JWT to the blacklist */
export async function blacklistToken(token: string, expiry: number) {
    await cache.set(`blacklist:${token}`, 'true', 'EX', expiry);
}

/*** Check if JWT is blacklisted */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await cache.get(`blacklist:${token}`);
    return result === 'true';
}


class RedisMessagingService {
    private publisher: Redis;
    private subscriber: Redis;
  
    constructor(redisUrl = `redis://${_host}:${_port}`) {
      this.publisher = new Redis(redisUrl);
      this.subscriber = new Redis(redisUrl);
    }

    /**
   * Publish a message to a channel
   * @param channel - The name of the channel
   * @param message - The message payload (JSON, string, etc.)
   */
  publish(channel: string, message: any): void {
    const payload = typeof message === "string" ? message : JSON.stringify(message);
    this.publisher.publish(channel, payload);
  }

  /**
   * Subscribe to a channel and execute a callback on message reception
   * @param channel - The name of the channel
   * @param callback - The function to call when a message is received
   */
  subscribe(channel: string, callback: (message: string) => void): void {
    this.subscriber.subscribe(channel, (err, count) => {
      if (err) {
        console.error(`Failed to subscribe to channel ${channel}:`, err);
        return;
      }
      console.log(`Subscribed to ${channel}. Listening to ${count} channel(s).`);
    });

    this.subscriber.on("message", (subscribedChannel, message) => {
      if (subscribedChannel === channel) {
        callback(message);
      }
    });
  }

  /**
   * Close the Redis connections
   */
  close(): void {
    this.publisher.disconnect();
    this.subscriber.disconnect();
  }
}

export const redisMessagingService = new RedisMessagingService();
export const redisConnection = cache;