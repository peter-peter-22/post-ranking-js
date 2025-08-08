import { getDays } from "../../db/controllers/engagementHistory/load";
import { EngagementHistory } from "../../db/schema/engagementHistory";
import { ProcessContext } from "../../userActions/posts/engagements/updates";
import { redisClient } from "../connect";
import { typedHSet } from "../typedHSet";

export function userEngagementHistoryRedisKey(viewerId: string, posterId: string, timeBucket: number) {
    return `engagementHistory:${viewerId}:counts:${timeBucket}:${posterId}`;
}

export function userEngagementHistoryScoresRedisKey(viewerId: string) {
    return `engagementHistory:${viewerId}:scores`;
}

export const engagementHistoryHsetSchema = typedHSet<CachedEngagementCounts>({
    likes: "number",
    replies: "number",
    clicks: "number",
    timeBucket: "number",
    viewerId: "string",
    publisherId: "string",
    isDirty: "boolean"
})

export type CachedEngagementCounts = Partial<EngagementHistory> & Pick<EngagementHistory, "publisherId" | "viewerId" | "timeBucket"> & { isDirty?: boolean }

export type EngagementUpdates = Pick<EngagementHistory, "likes" | "replies" | "clicks" | "publisherId">

export type EngagementCounts = Omit<EngagementUpdates, "publisherId">

/** Increment engagement counts and update scores. */
export const updateEngagementHistory = (viewerId: string, updates: EngagementUpdates[], { redis }: ProcessContext) => {
    // Get the edited time bucket
    const timeBucket = getDays()
    for (const { publisherId, likes, clicks, replies } of updates) {
        const key = userEngagementHistoryRedisKey(viewerId, publisherId, timeBucket)
        // Set initial values
        engagementHistoryHsetSchema.serializePartial({ publisherId, viewerId, timeBucket, isDirty: true })
        // Increment counters
        if (likes) redis.hIncrBy(key, "likes", likes)
        if (clicks) redis.hIncrBy(key, "clicks", clicks)
        if (replies) redis.hIncrBy(key, "clicks", replies)
        // Increment score
        redis.zIncrBy(
            userEngagementHistoryScoresRedisKey(viewerId),
            getEngagementHistoryScore({ likes, clicks, replies }),
            publisherId
        )
    }
}

export async function getEngagementHistoryScores(viewerId: string, posterIds: string[]) {
    return await redisClient.zmScore(userEngagementHistoryScoresRedisKey(viewerId), posterIds)
}

export function getEngagementHistoryScore(eh: EngagementCounts) {
    let score = 0
    if (eh.likes !== undefined) score += eh.likes
    if (eh.clicks !== undefined) score += eh.clicks
    if (eh.replies !== undefined) score += eh.replies
    return score
}