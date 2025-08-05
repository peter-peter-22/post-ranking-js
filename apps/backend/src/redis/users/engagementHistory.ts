import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../db";
import { engagementHistory, EngagementHistory } from "../../db/schema/engagementHistory";
import { cachedHset } from "../bulkHSetRead";
import { typedHSet } from "../typedHSet";
import { redisClient } from "../connect";
import { engagementHistoryJobs } from "../jobs/categories/engagementHistory";
import { userTTL } from "../common";

function userEngagementHistoryRedisKey(viewerId: string, posterId: string) {
    return `user:${viewerId}:engagementHistory:${posterId}`;
}
const schema = typedHSet<EngagementHistory>({
    likes: "number",
    replies: "number",
    clicks: "number",
    viewerId: "string",
    publisherId: "string",
})
const getKey = (viewerId: string) => (posterId: string) => userEngagementHistoryRedisKey(viewerId, posterId)

export const cachedEngagementHistory = (viewerId: string) => {
    return cachedHset<EngagementHistory>({
        schema,
        getKey: getKey(viewerId),
        generate: async (posterIds: string[]) => {
            // Fetch from db
            const rows = await db
                .select()
                .from(engagementHistory)
                .where(and(
                    eq(engagementHistory.viewerId, viewerId),
                    inArray(engagementHistory.publisherId, posterIds)
                ))
            // Createa a map
            const map = new Map<string, EngagementHistory>()
            for (const row of rows) {
                map.set(row.publisherId, row)
            }
            // Save to redis
            const multi = redisClient.multi()
            for (const posterId of posterIds) {
                const myHistory = map.get(posterId)
                const key = userEngagementHistoryRedisKey(viewerId, posterId)
                // If no prior engagement history belongs to this user, create a placeholder value in redis to prevent database fallbacks
                multi.hSet(key, schema.serialize(myHistory || {
                    viewerId,
                    publisherId: posterId,
                    likes: 0,
                    replies: 0,
                    clicks: 0
                }))
                multi.expire(key, userTTL)
            }
            await multi.exec()
            return rows
        },
        getId: (value: EngagementHistory) => value.publisherId,
    })
}

export type AggregatedEngagements=Omit<EngagementHistory,"viewerId">

// TODO: keep this in cache
export const updateEngagementHistory = async (viewerId: string, updates: AggregatedEngagements[]) => {
    // Ensure the cache is loaded before the increment happens
    await cachedEngagementHistory(viewerId).read(updates.map(e => e.publisherId))
    // Increment
    const multi = redisClient.multi()
    for (const { publisherId, likes, clicks, replies } of updates) {
        if (likes) multi.hIncrBy(userEngagementHistoryRedisKey(viewerId, publisherId), "likes", likes)
        if (clicks) multi.hIncrBy(userEngagementHistoryRedisKey(viewerId, publisherId), "clicks", clicks)
        if (replies) multi.hIncrBy(userEngagementHistoryRedisKey(viewerId, publisherId), "clicks", replies)
    }
    await multi.exec()
    // Shedule update job
    await engagementHistoryJobs.addJob({ data: viewerId })
}   