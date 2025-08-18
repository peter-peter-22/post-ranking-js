import { SearchReply } from "redis";
import { onlineUsersRedisKey, userContentRedisKey, userHsetSchema } from ".";
import { db } from "../../db";
import { engagementHistory } from "../../db/schema/engagementHistory";
import { User, users } from "../../db/schema/users";
import { bulkUpdateFromValues } from "../../db/utils/bulkUpdate";
import { currentTimeS, RedisMulti, userPersonalTTL, userTTL } from "../common";
import { redisClient } from "../connect";
import { CachedEngagementCounts, engagementHistoryHsetSchema, userEngagementHistoryRedisKey, userEngagementHistoryScoresRedisKey } from "./engagementHistory";
import { userFollowedPostsRedisKey, userFollowersRedisKey, userFollowingRedisKey } from "./follows";

const maxCount = 1000

export function touchUser(multi: RedisMulti, id: string) {
    multi.hSet(
        userContentRedisKey(id),
        userHsetSchema.serializePartial({ publicExpires: currentTimeS() + userTTL })
    )
}

export function touchOnlineUser(multi: RedisMulti, id: string) {
    multi.hSet(
        userContentRedisKey(id),
        userHsetSchema.serializePartial({ privateExpires: currentTimeS() + userPersonalTTL })
    )
}

export function setPrivateUserDataExistence(multi: RedisMulti, id: string, value: boolean) {
    multi.hSet(
        userContentRedisKey(id),
        userHsetSchema.serializePartial({ privateExists: value })
    )
    if (value) multi.sAdd(onlineUsersRedisKey, id)
    else multi.sRem(onlineUsersRedisKey, id)
}

async function handleUserExpiration() {
    // Get the expired users
    const usersToRemove = await getUsersToRemove()
    // Save realtime data
    await saveUserRealtimeData(usersToRemove)
    // Remove from redis
    await removeUserCachedData(usersToRemove)
}

async function removeUserCachedData(usersToRemove: User[]) {
    const multi = redisClient.multi()
    for (const user of usersToRemove) {
        multi.del(userContentRedisKey(user.id))
    }
    await multi.exec()
}

async function saveUserRealtimeData(usersToRemove: User[]) {
    const updates = usersToRemove.map(u => ({
        id: u.id,
        followerCount: u.followerCount,
        followingCount: u.followingCount
    }))
    await bulkUpdateFromValues({
        table: users,
        rows: updates,
        key: "id",
        updateCols: ["followerCount", "followingCount"]
    })
}

async function getUsersToRemove() {
    const time = currentTimeS()
    const query = `@publicExpires:[-inf ${time}] @privateExpires:[-inf ${time}]`;
    const results = await redisClient.ft.search('users', query, {
        LIMIT: { from: 0, size: maxCount }
    });
    return userHsetSchema.parseSearch(results)
}

async function handlerUserPrivateDataExpiration() {
    // Get the expired data
    const usersToRemove = await getUsersWithPersonalDataToRemove()
    // Save and uncache data
    await handleExpiredUsersPrivateData(usersToRemove)
}

async function handleExpiredUsersPrivateData(usersToRemove: User[]) {
    // Get all affected engagement histories
    const EHs = await getEngagementHistories(usersToRemove)
    // Save realtime data
    await saveUserPersonalRealtimeData(EHs)
    // Remove from redis
    await removeUserPersinalDataCache(usersToRemove, EHs)
}

async function removeUserPersinalDataCache(usersToRemove: User[], EHs: CachedEngagementCounts[]) {
    const multi = redisClient.multi()
    for (const user of usersToRemove) {
        multi.del(userFollowingRedisKey(user.id))
        multi.del(userEngagementHistoryScoresRedisKey(user.id))
        multi.del(userFollowersRedisKey(user.id))
        multi.del(userFollowedPostsRedisKey(user.id))
        setPrivateUserDataExistence(multi, user.id, false)
    }
    for (const eh of EHs) {
        multi.del(userEngagementHistoryRedisKey(eh.viewerId, eh.publisherId, eh.timeBucket))
    }
    multi.exec()
}

async function getUsersWithPersonalDataToRemove() {
    const time = currentTimeS()
    const query = `@privateExists:{1} @privateExpires:[-inf ${time}]`;
    const results = await redisClient.ft.search('users', query, {
        LIMIT: { from: 0, size: maxCount }
    });
    return userHsetSchema.parseSearch(results)
}

async function getEngagementHistories(usersToRemove: User[]) {
    const multi = redisClient.multi()
    for (const user of usersToRemove) {
        const query = `@viewerId:{${user.id}}`;
        multi.ft.search("engagementHistories", query)
    }
    const results = await multi.exec() as (SearchReply | undefined)[]
    const EHs: CachedEngagementCounts[] = []
    for (const result of results) {
        if (!result) continue
        EHs.push(...engagementHistoryHsetSchema.parseSearch(result as SearchReply))
    }
    return EHs
}

async function saveUserPersonalRealtimeData(EHs: CachedEngagementCounts[]) {
    // Get the modified engagement histories
    const modified = EHs.filter(EH => EH.isDirty)
    // Upsert to db
    await db
        .insert(engagementHistory)
        .values(modified)
        .onConflictDoUpdate({
            target: [engagementHistory.viewerId, engagementHistory.publisherId, engagementHistory.timeBucket],
            set: {
                likes: engagementHistory.likes,
                replies: engagementHistory.replies,
                clicks: engagementHistory.clicks
            }
        })
}

export async function handleAllUserExpirations() {
    await handlerUserPrivateDataExpiration()
    await handleUserExpiration()
}