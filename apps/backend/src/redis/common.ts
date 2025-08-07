import { mainFeedMaxAge } from "../posts/filters"
import { redisClient } from "./connect"
import { initializeRedisSearch } from "./search/schema"

export const defaultDataFeedTTL = 60 * 30
export const postTTL=defaultDataFeedTTL
export const userTTL = postTTL
export const userPersonalTTL = 60 * 60

export function getMainFeedTTL(createdAt: Date, minimumTTL: number) {
    const ageMs = new Date().getTime() - new Date(createdAt).getTime()
    const remainingTimeS = Math.round((mainFeedMaxAge - ageMs) / 1000)
    return Math.max(remainingTimeS, minimumTTL)
}

export type RedisMulti = ReturnType<typeof redisClient.multi>

export type ZSetEntry = {
    value: string,
    score: number
}

export function escapeTagValue(value: string): string {
    return value.replace(/([,\.\<\>\{\}\[\]\"\':;!@#\$%\^\&\*\(\)\-\+\=~])/g, '\\$1');
}

/** Return the current time in seconds. */
export function currentTimeS(){
    return new Date().getTime() / 1000
}

await initializeRedisSearch()