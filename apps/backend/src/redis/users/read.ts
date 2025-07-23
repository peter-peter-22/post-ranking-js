import { inArray } from "drizzle-orm";
import { db } from "../../db";
import { User, users } from "../../db/schema/users";
import { cachedBulkHSetRead } from "../cachedBulkRead";
import { userContentTTL } from "../common";

export function userContentRedisKey(id: string) {
    return `user:${id}:content`;
}

export const cachedUsers = cachedBulkHSetRead<User>({
    schema: {
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
    },
    ttlOnRead: userContentTTL,
    ttlOnWrite: () => userContentTTL,
    getKey: userContentRedisKey,
    fallback: async (ids: string[]) => await db.select().from(users).where(inArray(users.id, ids))
})