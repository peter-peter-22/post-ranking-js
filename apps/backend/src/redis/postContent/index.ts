import { inArray } from "drizzle-orm";
import { db } from "../../db";
import { Post, posts } from "../../db/schema/posts";
import { cachedHset } from "../bulkHSetRead";
import { getMainFeedTTL, postTTL, RedisMulti } from "../common";
import { redisClient } from "../connect";
import { typedHSet } from "../typedHSet";
import { cachedReplyWrite, getReplies } from "./replies";

export function postContentRedisKey(id: string) {
    return `post:${id}:content`;
}

export const postHsetSchema = typedHSet<Post>({
    id: "string",
    userId: "string",
    text: "string",
    createdAt: "date",
    likeCount: "number",
    replyCount: "number",
    viewCount: "number",
    clickCount: "number",
    topic: "string",
    engaging: "number",
    replyingTo: "string",
    engagementCount: "number",
    embeddingText: "string",
    embedding: "json",
    embeddingNormalized: "json",
    hashtags: "json",
    keywords: "json",
    mentions: "json",
    pending: "boolean",
    media: "json",
    commentScore: "number",
    timeBucket: "number",
    isReply: "boolean",
    deleted: "boolean",
    repliedUser: "string",
})
const getKey = postContentRedisKey

export const cachedPosts = cachedHset<Post>({
    schema: postHsetSchema,
    getKey,
    generate: generatePostCache,
    getId: (post: Post) => post.id
})

/** Write post to redis with ttl. */
export const cachedPostWrite = (posts: Post[], multi: RedisMulti, ttl?: number) => {
    for (const post of posts) {
        const key = postContentRedisKey(post.id)
        multi.hSet(key, postHsetSchema.serialize(post));
        multi.expire(key, ttl ? ttl : getMainFeedTTL(post.createdAt, postTTL))
    }
}

/** Fetch and cache the posts and their related data. */
async function generatePostCache(postIds: string[]) {
    const multi = redisClient.multi()
    const newPosts = await db.select().from(posts).where(inArray(posts.id, postIds))
    const postReplyMap = await getReplies(postIds)
    for (const post of newPosts) {
        const ttl = getMainFeedTTL(post.createdAt, postTTL)
        const myReplies = postReplyMap.get(post.id)
        // Cache the posts
        cachedPostWrite([post], multi, ttl)
        // Cache the replies
        if (myReplies) cachedReplyWrite(myReplies, post, multi)
    }
    await multi.exec()
    return newPosts
}