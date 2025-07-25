import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../db";
import { engagementHistory, EngagementHistory } from "../../db/schema/engagementHistory";
import { cachedBulkHSetRead, cachedBulkHSetWrite } from "../bulkHSetRead";
import { userEngagementHistoryTTL } from "../common";
import { typedHSet } from "../typedHSet";

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