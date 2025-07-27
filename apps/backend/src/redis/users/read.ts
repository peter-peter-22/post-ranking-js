import { inArray } from "drizzle-orm";
import { db } from "../../db";
import { User, users } from "../../db/schema/users";
import { cachedBulkHSetRead, cachedBulkHSetWrite } from "../bulkHSetRead";
import { userContentTTL } from "../common";
import { typedHSet } from "../typedHSet";

export function userContentRedisKey(id: string) {
    return `user:${id}:content`;
}

const getTTL = () => userContentTTL

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

export const cachedUsersRead = cachedBulkHSetRead<User>({
    schema,
    getTTL,
    getKey: userContentRedisKey,
    fallback: async (ids: string[]) => await db.select().from(users).where(inArray(users.id, ids)),
    getId: (user: User) => user.id
})

export const cachedUsersWrite = cachedBulkHSetWrite<User>({
    schema,
    getTTL,
    getKey: userContentRedisKey,
})