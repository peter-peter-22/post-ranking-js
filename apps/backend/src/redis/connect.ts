// Connect to redis and export the client.

import redis from "redis";
import { env } from "../zod/env";

/** Redis client for caching. */
const redisClient = redis.createClient({
    url: env.REDIS_URL
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

redisClient.connect().then(() => console.log(`Redis connected`))


export { redisClient }