import { mainFeedMaxAge } from "../posts/filters"
import { redisClient } from "./connect"
import { initializeRedisSearch } from "./search/schema"

export const defaultDataFeedTTL = 60 * 30
export const postTTL = defaultDataFeedTTL
export const userTTL = 60 * 60
export const userPersonalTTL = 60 * 60
export const onlineFollwersListTTL=30

export function getMainFeedExpiration(createdAt: Date) {
    return Math.round((new Date(createdAt).getTime() + mainFeedMaxAge) / 1000)
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
export function currentTimeS() {
    return Date.now() / 1000
}

await initializeRedisSearch()