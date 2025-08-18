import { and, eq } from "drizzle-orm"
import { onlineUsersRedisKey, userContentRedisKey } from "."
import { db } from "../../db"
import { createFollowNotification } from "../../db/controllers/notifications/createNotification"
import { createFollowSnapshot } from "../../db/controllers/users/follow/snapshots"
import { Follow, follows } from "../../db/schema/follows"
import { redisClient } from "../connect"
import { jobQueue } from "../jobs/queue"
import { onlineFollwersListTTL, RedisMulti } from "../common"

export function userFollowingRedisKey(id: string) {
    return `user:${id}:following`
}

export function userFollowersRedisKey(id: string) {
    return `user:${id}:followers`
}

export function temporalOnlineFollowersRedisKey(id: string) {
    return `user:${id}:onlineFollowers`
}

export function userFollowedPostsRedisKey(id: string) {
    return `user:${id}:postsFromFollowed`
}

/** Get which user ids are followed by a user.
 ** Does not checks cache exitence.
 */
export async function cachedFollowStatus(userId: string, targetUserIds: string[], multi: RedisMulti) {
    const key = userFollowingRedisKey(userId)
    multi.smIsMember(key, targetUserIds)
}

/** Calculates the online followers array in redis. */
export async function calculateOnlineFollowers(userId: string) {
    const key = temporalOnlineFollowersRedisKey(userId)
    const multi = redisClient.multi()
    multi.sInterStore(key, [userFollowersRedisKey(userId), onlineUsersRedisKey])
    multi.expire(key, onlineFollwersListTTL)
    await multi.exec()
}

/** Set cached data after a follow happens.
 ** Both the followed and the follower must be cached before calling.
 */
export async function setCachedFollow(followerId: string, followedId: string, value: boolean) {
    const [updated] = value ? (
        await db.insert(follows)
            .values({
                followedId,
                followerId
            })
            .onConflictDoNothing()
            .returning()
    ) : (
        await db.delete(follows)
            .where(and(
                eq(follows.followerId, followerId),
                eq(follows.followedId, followedId)
            ))
            .returning()
    )
    if (updated) await handleFollowChange(updated, value)
}

async function handleFollowChange(updated: Follow, value: boolean) {
    const add = value ? 1 : -1
    const multi = redisClient.multi()
    multi.hIncrBy(userContentRedisKey(updated.followedId), "followerCount", add)
    multi.hIncrBy(userContentRedisKey(updated.followerId), "followingCount", add)
    if (add) multi.sAdd(userFollowingRedisKey(updated.followerId), updated.followedId)
    else multi.sRem(userFollowingRedisKey(updated.followerId), updated.followedId)
    if (add) multi.sAdd(userFollowersRedisKey(updated.followedId), updated.followerId)
    else multi.sRem(userFollowersRedisKey(updated.followedId), updated.followerId)
    await Promise.all([
        multi.exec(),
        createFollowNotification(updated.followedId, updated.createdAt),
        createFollowSnapshot(updated.followerId, updated.followedId, value)
    ])
}