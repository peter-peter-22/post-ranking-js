import { redisClient } from "../redis/connect"

export const defaultDelay = 60_000
export const longDelay = 60_000 * 15

export const redisCounterTTL = 60 * 15

export async function incrementRedisCounter(key: string, add: number) {
    await redisClient.multi()
        .incrBy(key, add)
        .expire(key, redisCounterTTL)
        .exec()
}