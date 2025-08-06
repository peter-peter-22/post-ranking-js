import { inArray } from "drizzle-orm";
import { db } from "../../db";
import { loadAggregatedEngagementHistory, loadCurrentEngagementHistory } from "../../db/controllers/engagementHistory/update";
import { follows } from "../../db/schema/follows";
import { User, users } from "../../db/schema/users";
import { cachedHset } from "../bulkHSetRead";
import { userTTL } from "../common";
import { redisClient } from "../connect";
import { typedHSet } from "../typedHSet";
import { engagementHistoryHsetSchema, getEngagementHistoryScore, userEngagementHistoryRedisKey, userEngagementHistoryScoresRedisKey } from "./engagementHistory";
import { userFollowingRedisKey } from "./follows";
import { toMap } from "../utilities";

export function userContentRedisKey(id: string) {
    return `user:${id}:content`;
}

export const userHsetSchema = typedHSet<User>({
    id: "string",
    handle: "string",
    name: "string",
    createdAt: "date",
    followerCount: "number",
    followingCount: "number",
    interests: "json",
    bot: "boolean",
    embedding: "json",
    embeddingNormalized: "json",
    clusterId: "number",
    fullName: "string",
    avatar: "json",
    banner: "json",
    bio: "string"
})

export const cachedUsers = cachedHset<User>({
    schema: userHsetSchema,
    getKey: userContentRedisKey,
    generate: async (ids: string[]) => {
        const newUsers = await db.select().from(users).where(inArray(users.id, ids))
        console.log(db.select().from(follows).where(inArray(follows.followerId, ids)).toSQL())
        await addUsersToCache(newUsers)
        return newUsers
    },
    getId: (user: User) => user.id
})

export async function addUsersToCache(newUsers: User[]) {
    const userIds = newUsers.map(user => user.id)
    // TODO do these in pararrel
    const followsPerUser = toMap(
        await db.select().from(follows).where(inArray(follows.followerId, userIds)),
        (follow) => follow.followerId
    )
    const aggregatedEngagementHistoryPerUser = toMap(
        await loadAggregatedEngagementHistory(userIds),
        (eh) => eh.viewerId
    )
    const currentEngagementHistoryPerUser = toMap(
        await loadCurrentEngagementHistory(userIds),
        (eh) => eh.viewerId
    )
    const multi = redisClient.multi()
    for (const user of newUsers) {
        // User content
        const key = userContentRedisKey(user.id)
        multi.hSet(key, userHsetSchema.serialize(user))
        multi.expire(key, userTTL)
        // Follows
        const myFollows = followsPerUser.get(user.id)
        if (myFollows) {
            const followsKey = userFollowingRedisKey(user.id)
            multi.sAdd(followsKey, myFollows.map(f => f.followedId))
            multi.expire(followsKey, userTTL)
        }
        // Current engagement histories
        const myCurrentEngagementHistories = currentEngagementHistoryPerUser.get(user.id)
        if (myCurrentEngagementHistories) {
            for (const eh of myCurrentEngagementHistories) {
                const key = userEngagementHistoryRedisKey(user.id, eh.publisherId, eh.timeBucket)
                multi.hSet(key, engagementHistoryHsetSchema.serialize(eh))
                multi.expire(key, userTTL)
            }
        }
        // Total engagement history scores
        const myTotalEngagementHistories = aggregatedEngagementHistoryPerUser.get(user.id)
        if (myTotalEngagementHistories) {
            const key = userEngagementHistoryScoresRedisKey(user.id)
            multi.zAdd(key, myTotalEngagementHistories.map(eh => ({ value: eh.publisherId, score: getEngagementHistoryScore(eh) })))
            multi.expire(key, userTTL)
        }
        // Notifications
    }
    await multi.exec()
}