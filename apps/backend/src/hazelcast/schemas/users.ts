import { User } from "../../db/schema/users";
import { hazelClient } from "../connect";

export type CachedUser = Pick<User, "id" | "avatar" | "banner" | "bio" | "followerCount" | "followingCount" | "handle" | "name" | "createdAt" | "embedding">

export type CachedUserSerialized = Pick<User, "avatar" | "banner" | "bio" | "followerCount" | "followingCount" | "handle" | "name"> & { createdAt: number, embedding: string | null, __key: string }

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

export const usersMap = await hazelClient.getMap<string, CachedUserSerialized>('users');

export function serializeUser({ createdAt, embedding, id, name, handle, bio, avatar, banner, followerCount, followingCount }: CachedUser): CachedUserSerialized {
    return {
        __key: id,
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

export function deserializeUser({ createdAt, embedding, __key, ...rest }: CachedUserSerialized): CachedUser {
    return {
        ...rest,
        id: __key,
        createdAt: new Date(createdAt),
        embedding: embedding ? JSON.parse(embedding) : null
    }
}
