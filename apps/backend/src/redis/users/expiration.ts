import { userContentRedisKey, userHsetSchema } from ".";
import { users } from "../../db/schema/users";
import { bulkUpdateFromValues } from "../../db/utils/bulkUpdate";
import { getUserContents } from "../../posts/contentsOfUser";
import { currentTimeS, RedisMulti, userTTL } from "../common";
import { redisClient } from "../connect";

export function touchUser(multi: RedisMulti, id: string) {
    multi.hSet(
        userContentRedisKey(id),
        userHsetSchema.serializePartial({ publicExpires: currentTimeS() + userTTL })
    )
}

export function touchOnlineUser(multi: RedisMulti, id: string) {
    multi.hSet(
        userContentRedisKey(id),
        userHsetSchema.serializePartial({ privateExpires: currentTimeS() + userTTL })
    )
}

export function setPrivateUserDataExistence(multi: RedisMulti, id: string, value: boolean) {
    multi.hSet(
        userContentRedisKey(id),
        userHsetSchema.serializePartial({ privateExists: value })
    )
}

export async function handleUserExpiration() {
    // Get the expired users
    const time = currentTimeS()
    const query = `@publicExpires:[-inf ${time}] @privateExpires:[-inf ${time}]`;
    const results = await redisClient.ft.search('users', query, {
        LIMIT: { from: 0, size: 1000 }
    });
    const usersToRemove = userHsetSchema.parseSearch(results)
    // Save realtime data
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
    // Remove from redis
    const multi = redisClient.multi()
    for (const user of usersToRemove) {
        multi.del(userContentRedisKey(user.id))
    }
    await multi.exec()
}

export async function handlerUserPrivateDataExpiration() {
    // Get the expired data
    const time = currentTimeS()
    const query = `@privateExists:{1} @privateExpires:[-inf ${time}]`;
    const results = await redisClient.ft.search('users', query, {
        LIMIT: { from: 0, size: 1000 }
    });
    const usersToRemove = userHsetSchema.parseSearch(results)
    // Save realtime data
    // Remove from redis
}