import { inArray } from "drizzle-orm";
import { db } from "../../db";
import { User, users } from "../../db/schema/users";
import { cachedHset } from "../bulkHSetRead";
import { typedHSet } from "../typedHSet";
import { redisClient } from "../connect";
import { userTTL } from "../common";

export function userContentRedisKey(id: string) {
    return `user:${id}:content`;
}

const schema = typedHSet<User>({
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
    schema,
    getKey: userContentRedisKey,
    generate: async (ids: string[], { schema }) => {
        const newUsers = await db.select().from(users).where(inArray(users.id, ids))
        const multi = redisClient.multi()
        for (const user of newUsers) {
            const key = userContentRedisKey(user.id)
            multi.hSet(key, schema.serialize(user))
            multi.expire(key, userTTL)
        }
        await multi.exec()
        return newUsers
    },
    getId: (user: User) => user.id
})