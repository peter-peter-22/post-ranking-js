import { eq } from "drizzle-orm"
import { db } from "../../db"
import { follows } from "../../db/schema/follows"
import { followSetTTL } from "../common"
import { redisClient } from "../connect"
import { createPersistentSet } from "../persistentSet"

function userFollowListRedisKey(id: string) {
    return `user:${id}:follows`
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