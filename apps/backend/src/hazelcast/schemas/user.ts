import { db } from "../../db";
import { User, users } from "../../db/schema/users";
import { hazelClient } from "../connect";

export type CachedUser = Pick<User, "id" | "avatar" | "banner" | "bio" | "followerCount" | "followingCount" | "handle" | "name" | "createdAt" | "embedding">

export type CachedUserSerialized = Pick<User, "id" | "avatar" | "banner" | "bio" | "followerCount" | "followingCount" | "handle" | "name"> & { createdAt: number, embedding: string | null }

await hazelClient.getSql().execute(`
CREATE OR REPLACE MAPPING users (
    __key VARCHAR,             
    name VARCHAR,
    createdAt BIGINT,
    profilePicture JSON,
    embedding VARCHAR
)
TYPE IMap
OPTIONS (
    'keyFormat' = 'varchar',
    'valueFormat' = 'json-flat'
)
`);

const usersMap = await hazelClient.getMap<string, CachedUserSerialized>('users');

// 3. Insert data
const testUsers = await db.select().from(users).limit(10)

const serialized = testUsers.map(serializeUser)
await usersMap.putAll(serialized.map(u => [u.id, u]))

// 4. Query
const result = await hazelClient.getSql().execute('SELECT * FROM users');
for await (const row of result) {
    console.log(row);
}

export function serializeUser({ createdAt, embedding, id, name, handle, bio, avatar, banner, followerCount, followingCount }: CachedUser): CachedUserSerialized {
    return {
        id,
        name,
        handle,
        bio,
        avatar,
        banner,
        followerCount,
        followingCount,
        createdAt: new Date(createdAt).getTime(),
        embedding: JSON.stringify(embedding)
    }
}

export function deserializeUser({ createdAt, embedding, ...rest }: CachedUserSerialized): CachedUser {
    return {
        ...rest,
        createdAt: new Date(createdAt),
        embedding: embedding ? JSON.parse(embedding) : null
    }
}
