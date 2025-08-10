import { cachedPosts, postContentRedisKey, postHsetSchema, postLikersRedisKey } from "."
import { Post, posts, PostToInsert } from "../../db/schema/posts"
import { bulkUpdateFromValues } from "../../db/utils/bulkUpdate"
import { currentTimeS, RedisMulti } from "../common"
import { redisClient } from "../connect"
import { toMap } from "../utilities"
import { repliersRedisKey } from "./replies"

// General

const maxCount = 1000

export function touchPost(multi: RedisMulti, id: string) {
    multi.hSet(
        postContentRedisKey(id),
        postHsetSchema.serializePartial({})
    )
}

// Public

async function handlePostsPublicDataExpiration() {
    const expiredPosts = await getPostsPublicDataToRemove()
    await savePostsPublicData(expiredPosts)
    const multi = redisClient.multi()
    removePostsPublicData(expiredPosts, multi)
    expirePostsRankingData(expiredPosts, multi)
    await multi.exec()
}

/** Prevent the comments from expiring while their parent post still exists. */
async function excludeComments(expiredPosts: Post[]) {
    // Get parent posts
    const parentPostIds: string[] = []
    for (const post of expiredPosts)
        if (post.replyingTo) parentPostIds.push(post.replyingTo)
    const parentPosts = await cachedPosts.read(parentPostIds)
    // Remove the replies where the parent post has longer expiration
    return expiredPosts.filter(r => {
        if (!r.replyingTo) return true
        const parentPost = parentPosts.get(r.replyingTo)
        if (!parentPost) return true
        const parentPostExpires = Math.max(parentPost.publicExpires || 0, parentPost.rankingExpires || 0)
        return parentPostExpires <= (r.publicExpires || 0)
    })
}

async function getPostsPublicDataToRemove() {
    const time = currentTimeS()
    const query = `@publicExpires:[-inf ${time}] @commentsExpires:[-inf ${time}] @rankingExpires:[-inf ${time}]`;
    const results = await redisClient.ft.search('posts', query, {
        LIMIT: { from: 0, size: maxCount }
    });
    return await excludeComments(postHsetSchema.parseSearch(results))
}

async function savePostsPublicData(expiredPosts: Post[]) {
    const updates: Partial<PostToInsert>[] = expiredPosts.map(p => ({
        id: p.id,
        likeCount: p.likeCount,
        replyCount: p.replyCount,
        clickCount: p.clickCount,
        viewCount: p.viewCount
    }))
    await bulkUpdateFromValues({
        table: posts,
        rows: updates,
        key: "id",
        updateCols: ["likeCount", "replyCount", "clickCount", "viewCount"]
    })
}

function removePostsPublicData(expiredPosts: Post[], multi: RedisMulti) {
    for (const post of expiredPosts) {
        multi.del(postContentRedisKey(post.id))
        multi.del(repliersRedisKey(post.id))
    }
}

// Ranked

async function handlePostsRankingDataExpiration() {
    const expiredPosts = await getPostsRankedDataToRemove()
    const multi = redisClient.multi()
    expirePostsRankingData(expiredPosts, multi)
    await multi.exec()
}

async function getPostsRankedDataToRemove() {
    const time = currentTimeS()
    const query = `@rankingExists:{0} @rankingExpires:[-inf ${time}]`;
    const results = await redisClient.ft.search('posts', query, {
        LIMIT: { from: 0, size: maxCount }
    });
    return postHsetSchema.parseSearch(results)
}

function expirePostsRankingData(expiredPosts: Post[], multi: RedisMulti) {
    for (const post of expiredPosts) {
        multi.del(postLikersRedisKey(post.id))
    }
}

// Aggregate

export async function handleAllPostExpirations() {
    await handlePostsRankingDataExpiration()
    await handlePostsPublicDataExpiration()
}