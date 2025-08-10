import { inArray } from "drizzle-orm";
import { db } from "../../db";
import { likes } from "../../db/schema/likes";
import { Post, posts } from "../../db/schema/posts";
import { processEngagementUpdates } from "../../userActions/posts/engagements/updates";
import { PreparedPost } from "../../userActions/posts/preparePost";
import { cachedHset } from "../bulkHSetRead";
import { currentTimeS, getMainFeedExpiration, postTTL, RedisMulti } from "../common";
import { redisClient } from "../connect";
import { typedHSet } from "../typedHSet";
import { toMap } from "../utilities";
import { cachedReplyWrite, getReplies } from "./replies";
import { mainFeedMaxAge } from "../../posts/filters";

export function postContentRedisKey(id: string) {
    return `post:${id}:content`;
}

export function postLikersRedisKey(id: string) {
    return `post:${id}:likers`
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
    publicExpires: "number",
    rankingExists: "boolean",
    rankingExpires: "number",
    commentsExists: "boolean",
})
const getKey = postContentRedisKey

/** Write post to redis with ttl. */
const cachedPostWrite = (posts: Post[], multi: RedisMulti) => {
    for (const post of posts) {
        const key = postContentRedisKey(post.id)
        multi.hSet(key, postHsetSchema.serialize({ ...post, publicExpires: currentTimeS() + postTTL }));
    }
}

/** Fetch and cache the posts and their related data. */
export const cachedPosts = cachedHset<Post>({
    schema: postHsetSchema,
    getKey,
    generate: generatePostCache,
    getId: (post: Post) => post.id
})

/** Fetch and cache posts. */
async function generatePostCache(postIds: string[]) {
    const newPosts = await db.select().from(posts).where(inArray(posts.id, postIds))
    const multi = redisClient.multi()
    cachedPostWrite(newPosts, multi)
    await multi.exec()
    await generateCommentSectionCache(newPosts)
    return newPosts
}

/** Fetch and comment sections. */
async function generateCommentSectionCache(newPosts: Post[]) {
    const multi = redisClient.multi()
    const postReplyMap = await getReplies(newPosts)
    for (const post of newPosts) {
        const myReplies = postReplyMap.get(post.id)
        multi.hSet(postContentRedisKey(post.id), postHsetSchema.serializePartial({
            commentsExists: true,
        }))
        if (myReplies) cachedReplyWrite(myReplies, post, multi)
    }
    await multi.exec()
    return postReplyMap
}

/** Fetch and cache post ranking related data. Also includes comment section data. */
async function generateRankedPostCache(newPosts: Post[]) {
    // Filter out the posts those need ranking data
    const currentTime = new Date().getTime()
    newPosts = newPosts.filter(post => {
        const age = currentTime - new Date(post.createdAt).getTime()
        return age < mainFeedMaxAge
    })
    if (newPosts.length == 0) return

    // Common data
    const postIds = newPosts.map(p => p.id)
    const multi = redisClient.multi()
    // Cache comment sections
    const missingCommentSections = newPosts.filter(p => !p.commentsExists)
    await generateCommentSectionCache(missingCommentSections)
    // Get likes
    const allLikes = await db
        .select({
            postId: likes.postId,
            userId: likes.userId
        })
        .from(likes)
        .where(inArray(likes.postId, postIds))
    const likeMap = toMap(
        allLikes,
        like => like.postId
    )
    // Write cache
    for (const post of newPosts) {
        // Set ranked data namespace expiration
        multi.hSet(postContentRedisKey(post.id), postHsetSchema.serializePartial({
            rankingExists: true,
            rankingExpires: getMainFeedExpiration(post.createdAt)
        }))
        // Save liker user ids
        const myLikes = likeMap.get(post.id)
        if (myLikes)
            multi.sAdd(postLikersRedisKey(post.id), myLikes.map(l => l.userId))
    }
}

/** Handle all cache related operations and notifications of a inserted post. */
export async function handlePostInsert({ post, replied }: PreparedPost) {
    const multi = redisClient.multi()
    if (post.replyingTo && replied) {
        multi.hIncrBy(postContentRedisKey(post.replyingTo), "replyCount", 1)
        cachedReplyWrite([post], replied, multi)
    }
    else {
        cachedPostWrite([{
            ...post,
            rankingExpires: getMainFeedExpiration(post.createdAt),
            rankingExists: true,
            commentsExists: true
        }], multi)
    }
    await Promise.all([
        multi.exec(),
        post.replyingTo ? processEngagementUpdates(post.userId, {
            replies: [{
                postId: post.replyingTo,
                posterId: post.userId,
                date: post.createdAt,
                value: true
            }]
        }) : undefined,
    ])
}