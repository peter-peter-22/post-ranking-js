import { getDays } from "../../db/controllers/engagementHistory/load";
import { EngagementHistory } from "../../db/schema/engagementHistory";
import { ProcessContext } from "../../userActions/posts/engagements/updates";
import { redisClient } from "../connect";
import { typedHSet } from "../typedHSet";

export function userEngagementHistoryRedisKey(viewerId: string, posterId: string, timeBucket: number) {
    return `user:${viewerId}:engagementHistory:counts:${timeBucket}:${posterId}`;
}

export function userEngagementHistoryScoresRedisKey(viewerId: string) {
    return `user:${viewerId}:engagementHistory:scores`;
}

export const engagementHistoryHsetSchema = typedHSet<EngagementCounts>({
    likes: "number",
    replies: "number",
    clicks: "number",
    timeBucket: "number"
})

export type EngagementCounts = Pick<Partial<EngagementHistory>, "likes" | "clicks" | "replies" | "timeBucket">

export type EngagementUpdates = Required<EngagementCounts> & { publisherId: string }

/** Increment engagement counts and update scores. */
export const updateEngagementHistory = (viewerId: string, updates: EngagementUpdates[], { redis }: ProcessContext) => {
    // Get the edited time bucket
    const timeBucket = getDays()
    for (const { publisherId, likes, clicks, replies } of updates) {
        const key = userEngagementHistoryRedisKey(viewerId, publisherId, timeBucket)
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