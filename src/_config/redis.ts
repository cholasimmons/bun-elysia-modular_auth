import Redis from "ioredis";

export const cache = new Redis({
    host: Bun.env.NODE_ENV === 'production' ? (String(Bun.env.REDIS_HOST) || '127.0.0.1') : '127.0.0.1',
    port: Number(Bun.env.REDIS_PORT) || 6379,
});

/*** Returns JSON parsed data */
export const redisGet = async <T>(key: string): Promise<T | null> => {
    const data = await cache.get(key);
    return data ? JSON.parse(data) : null;
};

/*** Returns true/false depending on success or failure of retriving data of that key */
export const redisSet = async (key: string, data: any, lifespan:number = 3600): Promise<boolean> => {
    return (await cache.setex(key, lifespan, JSON.stringify(data))) === 'OK';
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