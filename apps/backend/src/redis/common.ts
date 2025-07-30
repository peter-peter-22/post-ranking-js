import { mainFeedMaxAge } from "../posts/filters"
import { redisClient } from "./connect"

export const defaultDataFeedTTL = 60 * 10

const postTTL=defaultDataFeedTTL
export const postContentTTL = postTTL
export const commentSectionTTL = postTTL
export const userContentTTL = postTTL

const userPersonalTTL = 60 * 60
export const followSetTTL = userPersonalTTL
export const postPersonalEngagementsTTL = userPersonalTTL
export const userEngagementHistoryTTL = userPersonalTTL

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