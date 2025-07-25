import { mainFeedMaxAge } from "../posts/filters"

export const defaultDataFeedTTL = 60 * 10
export const postContentTTL = 60 * 10
export const userContentTTL = 60 * 10
const userPersonalTTL = 60 * 60
export const followSetTTL = userPersonalTTL
export const postPersonalEngagementsTTL = userPersonalTTL
export const userEngagementHistoryTTL=userPersonalTTL

export function getMainFeedTTL(createdAt: Date, minimumTTL: number) {
    const ageMs = new Date().getTime() - createdAt.getTime()
    const remainingTimeS = (mainFeedMaxAge - ageMs) / 1000
    return Math.max(remainingTimeS, minimumTTL)
}