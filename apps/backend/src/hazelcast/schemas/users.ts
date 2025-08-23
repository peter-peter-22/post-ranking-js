import { User } from "../../db/schema/users";
import { hazelClient } from "../connect";

export type CachedUser = Pick<User, "id" | "avatar" | "banner" | "bio" | "followerCount" | "followingCount" | "handle" | "name" | "createdAt" | "embedding" | "avatar" | "banner">

export type CachedUserSerialized = {
    __key: string
    name: string
    handle: string
    bio: string | null
    avatar: string | null
    banner: string | null
    followerCount: number
    followingCount: number
    createdAt: number
    embedding: string | null
}

await hazelClient.getSql().execute(`
CREATE OR REPLACE MAPPING users (
    __key VARCHAR,     
    name VARCHAR,
    handle VARCHAR,
    bio VARCHAR,
    avatar VARCHAR,
    banner VARCHAR,
    followerCount INTEGER,
    followingCount INTEGER,
    createdAt BIGINT,
    embedding VARCHAR
)
TYPE IMap
OPTIONS (
    'keyFormat' = 'varchar',
    'valueFormat' = 'json-flat'
)
`);

export const usersMap = await hazelClient.getMap<string, CachedUserSerialized>('users');

export function serializeUser({ createdAt, embedding, id, avatar, banner, ...rest }: CachedUser): CachedUserSerialized {
    return {
        __key: id,
        avatar: JSON.stringify(avatar),
        banner: JSON.stringify(banner),
        createdAt: new Date(createdAt).getTime(),
        embedding: JSON.stringify(embedding),
        ...rest
    }
}

export function deserializeUser({ createdAt, embedding, avatar, banner, __key, ...rest }: CachedUserSerialized): CachedUser {
    return {
        ...rest,
        id: __key,
        createdAt: new Date(createdAt),
        embedding: embedding ? JSON.parse(embedding) : null,
        avatar: avatar ? JSON.parse(avatar) : null,
        banner: banner ? JSON.parse(banner) : null
    }
}
