import { inArray } from "drizzle-orm";
import { db } from "../../db";
import { Follow, follows } from "../../db/schema/follows";
import { User, users } from "../../db/schema/users";
import { cachedHset } from "../bulkHSetRead";
import { userTTL } from "../common";
import { redisClient } from "../connect";
import { typedHSet } from "../typedHSet";
import { userFollowingRedisKey } from "./follows";

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
    const followMap = groupFollows(await db.select().from(follows).where(inArray(follows.followerId, newUsers.map(user => user.id))))
    const multi = redisClient.multi()
    for (const user of newUsers) {
        // User content
        const key = userContentRedisKey(user.id)
        multi.hSet(key, userHsetSchema.serialize(user))
        multi.expire(key, userTTL)
        // Follows
        const myFollows = followMap.get(user.id)
        if (myFollows) {
            const followsKey = userFollowingRedisKey(user.id)
            multi.sAdd(followsKey, [...myFollows])
            multi.expire(followsKey, userTTL)
        }
        // Notifications
    }
    await multi.exec()
}

function groupFollows(follows: Follow[]) {
    const map = new Map<string, Set<string>>()
    for (const follow of follows) {
        let set = map.get(follow.followerId)
        if (set === undefined) {
            set = new Set<string>()
            map.set(follow.followerId, set)
        }
        set.add(follow.followedId)
    }
    return map
}