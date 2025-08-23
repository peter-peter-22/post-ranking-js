import { Post } from "../../db/schema/posts";
import { hazelClient } from "../connect";

export type CachedPost = Pick<Post, "id" | "userId" | "text" | "likeCount" | "replyCount" | "clickCount" | "viewCount" | "topic" | "engaging" | "replyingTo" | "createdAt" | "embedding" | "media" | "deleted" | "rootPostId">

export type CachedPostSerialized = {
    __key: string
    userId: string
    text: string | null
    likeCount: number
    replyCount: number
    clickCount: number
    viewCount: number
    topic: string | null
    engaging: number
    replyingTo: string | null
    createdAt: number
    embedding: string | null
    media: string | null
    deleted: boolean
    rootPostId: string | null
}

await hazelClient.getSql().execute(`
CREATE OR REPLACE MAPPING posts (
    __key VARCHAR,     
    userId VARCHAR,
    text VARCHAR,
    likeCount INTEGER,
    replyCount INTEGER,
    clickCount INTEGER,
    viewCount INTEGER,
    topic VARCHAR,
    engaging REAL,
    replyingTo VARCHAR,
    createdAt BIGINT,
    embedding VARCHAR,
    media VARCHAR,
    deleted BOOLEAN,
    rootPostId VARCHAR
)
TYPE IMap
OPTIONS (
    'keyFormat' = 'varchar',
    'valueFormat' = 'json-flat'
)
`);

export const postsMap = await hazelClient.getMap<string, string>('posts');

console.log(await postsMap.get("0000ec5e-34b8-40ce-8c69-2447d4cc0380"))

export function serializePost({ createdAt, embedding, id, media, ...rest }: CachedPost): CachedPostSerialized {
    return {
        __key: id,
        createdAt: new Date(createdAt).getTime(),
        embedding: JSON.stringify(embedding),
        media: JSON.stringify(media),
        ...rest
    }
}

export function deserializeUser({ createdAt, embedding, __key, media, ...rest }: CachedPostSerialized): CachedPost {
    return {
        id: __key,
        createdAt: new Date(createdAt),
        embedding: embedding ? JSON.parse(embedding) : null,
        media: media ? JSON.parse(media) : null,
        ...rest
    }
}
