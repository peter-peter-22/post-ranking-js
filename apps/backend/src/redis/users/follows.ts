import { and, eq } from "drizzle-orm"
import { db } from "../../db"
import { Follow, follows } from "../../db/schema/follows"
import { followSetTTL } from "../common"
import { redisClient } from "../connect"
import { createPersistentSet } from "../persistentSet"
import { userContentRedisKey } from "./read"
import { standardJobs } from "../jobs/queue"
import { createFollowNotification } from "../../db/controllers/notifications/createNotification"

function userFollowListRedisKey(id: string) {
    return `user:${id}:following`
}

export async function cachedFollowStatus(userId: string, targetUserIds: string[]) {
    if (targetUserIds.length === 0) return new Set<string>()

    // try redis
    const key = userFollowListRedisKey(userId)
    const multi = redisClient.multi()
    multi.exists(key)
    multi.expire(key, followSetTTL)
    for (const targetUserId of targetUserIds) {
        multi.sIsMember(key, targetUserId)
    }
    const [exists, _, ...results] = await multi.exec()
    console.log("Follow list cache hit: " + (exists ? "yes" : "no"))
    if (exists) {
        const followed = new Set<string>()
        for (let n = 0; n < targetUserIds.length; n++) {
            const id = targetUserIds[n]
            const value = results[n]
            if (value) followed.add(id)
        }
        return followed
    }

    // if no data, fetch from db and set redis
    const allFollows = await db.select().from(follows).where(eq(follows.followerId, userId))
    const ids = allFollows.map(f => f.followedId)
    await redisClient.multi()
        .sAdd(key, createPersistentSet(ids))
        .expire(key, followSetTTL)
        .exec()
    return new Set<string>(ids)
}

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
    if (updated) await handleFollowChange(updated,value)
}

async function handleFollowChange(updated: Follow, value: boolean) {
    const add = value ? 1 : -1
    await Promise.all([
        redisClient.multi()
            .hIncrBy(userContentRedisKey(updated.followedId), "followerCount", add)
            .hIncrBy(userContentRedisKey(updated.followerId), "followingCount", add),
        standardJobs.addJobs([
            { category: "followingCount", data: updated.followerId, key: updated.followerId },
            { category: "followerCount", data: updated.followedId, key: updated.followedId }
        ]),
        createFollowNotification(updated.followedId, updated.createdAt)
    ])
}