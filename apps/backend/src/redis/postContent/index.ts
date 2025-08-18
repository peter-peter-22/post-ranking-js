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
import { fanoutPostToFollowers } from "../jobs/categories/postFanoutToFollowers";

export function postContentRedisKey(id: string) {
    return `post:${id}:content`;
}

export function postLikersRedisKey(id: string) {
    return `post:${id}:likers`
}

export function postsOfUserRedisKey(id: string) {
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
    isReply: "boolean",
    media: "json",
    commentScore: "number",
    timeBucket: "number",
    deleted: "boolean",
    publicExpires: "number",
    rankingExists: "boolean",
    rankingExpires: "number",
    commentsExists: "boolean",
    rootPostId: "number"
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
    // Cache public data
    const all = await db.select().from(posts).where(inArray(posts.id, postIds))
    const postsOnly: Post[] = []
    const repliesOnly: Post[] = []
    for (const post of all)
        if (post.rootPostId)
            repliesOnly.push(post)
        else
            postsOnly.push(post)
    const multi = redisClient.multi()
    cachedPostWrite(postsOnly, multi)
    await multi.exec()

    // Filter out the posts those need ranking data
    const currentTime = Date.now()
    const needRanking = postsOnly.filter(post => {
        const age = currentTime - new Date(post.createdAt).getTime()
        return age < mainFeedMaxAge
    })

    // Load cache ranking and comment cache. They don't overlap.
    await Promise.all([
        generateCommentSectionCache(repliesOnly),
        generateRankedPostCache(needRanking)
    ])

    return all
}

/** Fetch and cache comment sections. */
async function generateCommentSectionCache(newPosts: Post[]) {
    if (newPosts.length === 0) return
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
    if (newPosts.length === 0) return
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

/** Handle all cache related operations and notifications of a inserted post.
 * When a new post is inserted, mark all namespaces as existing to prevent unnecessary fallbacks. 
 */
export async function handlePostInsert({ post, replied }: PreparedPost) {
    const promises: Promise<any>[] = []

    if (post.replyingTo && replied) {
        // Cache reply
        const multi = redisClient.multi()
        cachedReplyWrite([{ ...post, commentsExists: true }], replied, multi)
        promises.push(multi.exec())
        // Handle Engagement updates
        processEngagementUpdates(post.userId, {
            replies: [{
                post: post,
                date: post.createdAt,
                value: true
            }]
        })
    }
    else {
        // Cache post
        const multi = redisClient.multi()
        cachedPostWrite([{
            ...post,
            rankingExpires: getMainFeedExpiration(post.createdAt),
            rankingExists: true,
            commentsExists: true
        }], multi)
        promises.push(multi.exec())
        // Handle fanout
        promises.push(fanoutPostToFollowers.addJob({ data: { userId: post.userId, postId: post.userId } }))
    }

    await Promise.all(promises)
}