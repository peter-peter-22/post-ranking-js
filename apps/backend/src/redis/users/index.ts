import { inArray } from "drizzle-orm";
import { db } from "../../db";
import { loadAggregatedEngagementHistory, loadCurrentEngagementHistory } from "../../db/controllers/engagementHistory/load";
import { follows } from "../../db/schema/follows";
import { User, users } from "../../db/schema/users";
import { cachedHset } from "../bulkHSetRead";
import { RedisMulti } from "../common";
import { redisClient } from "../connect";
import { typedHSet } from "../typedHSet";
import { toMap } from "../utilities";
import { setPrivateUserDataExistence, touchOnlineUser, touchUser } from "./expiration";
import { engagementHistoryHsetSchema, getEngagementHistoryScore, userEngagementHistoryRedisKey, userEngagementHistoryScoresRedisKey } from "./engagementHistory";
import { userFollowingRedisKey } from "./follows";

/** Redis key for user hsets, those are also used as anchor keys for related public data. */
export function userContentRedisKey(id: string) {
    return `user:${id}:content`;
}

export const onlineUsersRedisKey = "onlineUsers"

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
    bio: "string",
    publicExpires: "number",
    privateExpires: "number",
    privateExists: "boolean"
})

export const cachedUsers = cachedHset<User>({
    schema: userHsetSchema,
    getKey: userContentRedisKey,
    generate: async (ids: string[]) => {
        // Get users from db
        const newUsers = await db.select().from(users).where(inArray(users.id, ids))
        // Save to redis
        const multi = redisClient.multi()
        await addUsersToCache(newUsers, multi)
        await multi.exec()
        return newUsers
    },
    getId: (user: User) => user.id,
    onRead: async (values) => {
        // Update expiration on read
        const multi = redisClient.multi()
        for (const value of values.values()) {
            if (!value) continue
            touchUser(multi, value.id)
        }
        await multi.exec()
    }
})

export function addUsersToCache(newUsers: User[], multi: RedisMulti) {
    for (const user of newUsers) {
        const key = userContentRedisKey(user.id)
        multi.hSet(key, userHsetSchema.serialize(user))
        touchUser(multi, user.id)
    }
}

export async function generateOnlineUserCache(newUsers: User[]) {
    const { followsPerUser, currentEHsPerUser, aggregatedEHsPerUser } = await getOnlineUserData(newUsers)
    const multi = redisClient.multi()
    // User content
    addUsersToCache(newUsers, multi)
    for (const user of newUsers) {
        // Config cache expiration
        setPrivateUserDataExistence(multi, user.id, true)
        touchOnlineUser(multi, user.id)
        // Follows
        const myFollows = followsPerUser.get(user.id)
        if (myFollows) {
            const key = userFollowingRedisKey(user.id)
            multi.sAdd(key, myFollows.map(f => f.followedId))
        }
        // Current engagement histories
        const myCurrentEngagementHistories = currentEHsPerUser.get(user.id)
        if (myCurrentEngagementHistories) {
            for (const eh of myCurrentEngagementHistories) {
                const key = userEngagementHistoryRedisKey(user.id, eh.publisherId, eh.timeBucket)
                multi.hSet(key, engagementHistoryHsetSchema.serialize(eh))
            }
        }
        // Total engagement history scores
        const myTotalEngagementHistories = aggregatedEHsPerUser.get(user.id)
        if (myTotalEngagementHistories) {
            const key = userEngagementHistoryScoresRedisKey(user.id)
            multi.zAdd(key, myTotalEngagementHistories.map(eh => ({ value: eh.publisherId, score: getEngagementHistoryScore(eh) })))
        }
        // Followed posts

        // Notifications
    }
    await multi.exec()
}

async function getOnlineUserData(newUsers: User[]) {
    const userIds = newUsers.map(user => user.id)
    const [totalFollows, totalAggregatedEHs, totalCurrentEHs] = await Promise.all([
        await db.select().from(follows).where(inArray(follows.followerId, userIds)),
        await loadAggregatedEngagementHistory(userIds),
        await loadCurrentEngagementHistory(userIds),

    ])
    const followsPerUser = toMap(
        totalFollows,
        (follow) => follow.followerId
    )
    const aggregatedEHsPerUser = toMap(
        totalAggregatedEHs,
        (eh) => eh.viewerId
    )
    const currentEHsPerUser = toMap(
        totalCurrentEHs,
        (eh) => eh.viewerId
    )
    return { followsPerUser, aggregatedEHsPerUser, currentEHsPerUser }
}

/** Load the personal data of online users to the cache if does not exists. */
export async function ensureUserPersonalData(user: User) {
    if (!user.privateExists)
        await generateOnlineUserCache([user])
}

async function getFollowedPosts(userId:string[]){
    return 
}