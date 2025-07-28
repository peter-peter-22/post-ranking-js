import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../db";
import { engagementHistory, EngagementHistory } from "../../db/schema/engagementHistory";
import { cachedBulkHSetRead, cachedBulkHSetWrite } from "../bulkHSetRead";
import { userEngagementHistoryTTL } from "../common";
import { typedHSet } from "../typedHSet";
import { redisClient } from "../connect";
import { engagementHistoryJobs } from "../jobs/categories/engagementHistory";

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
const getTTL = () => userEngagementHistoryTTL
const getKey = (viewerId: string) => (posterId: string) => userEngagementHistoryRedisKey(viewerId, posterId)

export const cachedEngagementHistoryRead = async (viewerId: string, posterIds: string[]) => {
    return await cachedBulkHSetRead<EngagementHistory>({
        schema,
        getKey: getKey(viewerId),
        getTTL: getTTL,
        fallback: async (posterIds: string[]) => await db
            .select()
            .from(engagementHistory)
            .where(and(
                eq(engagementHistory.viewerId, viewerId),
                inArray(engagementHistory.publisherId, posterIds)
            )),
        getId: (value: EngagementHistory) => value.publisherId
    })
        .read(posterIds)
}

export const cachedEngagementHistoryWrite = async (viewerId: string, values: EngagementHistory[]) => {
    return await cachedBulkHSetWrite<EngagementHistory>({
        schema,
        getKey: getKey(viewerId),
        getTTL: getTTL
    })
        .write(values)
}

export const updateEngagementHistory = async (viewerId: string, updates: { posterId: string, addLikes?: number, addClicks?: number, addReplies?: number }[]) => {
    // Ensure the cache is loaded before the increment happens
    await cachedEngagementHistoryRead(viewerId, updates.map(e => e.posterId))
    // Increment
    const multi = redisClient.multi()
    for (const { posterId, addLikes, addClicks, addReplies } of updates) {
        if (addLikes) multi.hIncrBy(userEngagementHistoryRedisKey(viewerId, posterId), "likes", addLikes)
        if (addClicks) multi.hIncrBy(userEngagementHistoryRedisKey(viewerId, posterId), "clicks", addClicks)
        if (addReplies) multi.hIncrBy(userEngagementHistoryRedisKey(viewerId, posterId), "clicks", addReplies)
    }
    await multi.exec()
    // Shedule update job
    await engagementHistoryJobs.addJob({ data: viewerId })
}   