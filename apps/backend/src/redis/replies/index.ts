import { inArray } from "drizzle-orm"
import { db } from "../../db"
import { Post, posts } from "../../db/schema/posts"
import { commentSectionTTL, getMainFeedTTL, RedisMulti } from "../common"
import { redisClient } from "../connect"
import { cachedPostWrite } from "../postContent/read"
import { cachedFollowStatus, userFollowListRedisKey } from "../users/follows"

function repliesRedisKey(postId: string) {
    return `post:${postId}:replies:main`
}
function repliesOfAuthorRedisKey(postId: string) {
    return `post:${postId}:replies:author`
}
function repliersRedisKey(postId: string) {
    return `post:${postId}:replies:users`
}
function repliesExistRedisKey(postId: string) {
    return `post:${postId}:replies:exists`
}

export async function getFollowedReplierCounts(userId: string, targetPosts: Post[], disableFallback: boolean = false) {
    // Try to get the followed comment counts from redis
    const multi = redisClient.multi()
    for (const post of targetPosts) {
        multi.sInterCard([repliersRedisKey(post.id), userFollowListRedisKey(userId)])
        multi.get(repliesExistRedisKey(post.id))
    }
    const results = await multi.exec()

    // Format the results and count the missing caches
    const missingIndexes: number[] = []
    const counts = targetPosts.map((_, i) => {
        const redisIndex = i * 2
        const count = results[redisIndex] as number
        const exists = Boolean(results[redisIndex + 1])
        if (!exists) {
            missingIndexes.push(i)
            return 0
        }
        return count
    })
    console.log(`Comment section cache miss ${missingIndexes.length} of ${targetPosts.length}`)
    if (missingIndexes.length > 0 && disableFallback) console.warn("Missing comment section cache while fallback is disabled")

    // If there are missing caches, set their content then try to get them again
    if (missingIndexes.length > 0 && !disableFallback) {
        const missingPosts = missingIndexes.map(i => targetPosts[i])
        await Promise.all([
            generateReplyCache(missingPosts),
            cachedFollowStatus(userId, [])
        ])
        const newCounts = await getFollowedReplierCounts(userId, missingPosts, true)
        for (let i = 0; i < missingIndexes.length; i++) {
            counts[missingIndexes[i]] = newCounts[i]
        }
    }

    return counts
}

async function generateReplyCache(targetPosts: Post[]) {
    // Get the replies from the db
    const replies = await db
        .select()
        .from(posts)
        .where(inArray(posts.replyingTo, targetPosts.map(p => p.id)))

    // Group by replied post id
    const replyMap = new Map<string, Post[]>()
    for (const post of replies) {
        if (!post.replyingTo) continue
        let replies = replyMap.get(post.replyingTo)
        if (!replies) {
            replies = []
            replyMap.set(post.replyingTo, replies)
        }
        replies.push(post)
    }

    // Set cache
    const multi = redisClient.multi()
    for (const post of targetPosts) {
        const replies = replyMap.get(post.id)
        writeReplyCache(replies || [], post, multi)
    }
    await multi.exec()

    // Return the replies for optional further usage
    return replies
}

export function writeReplyCache(replies: Post[], post: Post, multi: RedisMulti) {
    // Set existence and expiration
    multi.set(repliesExistRedisKey(post.id), '1')
    updateCommentSectionTTLs(multi, post.id, post.createdAt)
    // Exit if nothing else to do
    if (replies.length === 0) return
    // Separate the replies of the author
    const otherReplies: Post[] = []
    const repliesOfAuthor: Post[] = []
    for (const reply of replies) {
        if (reply.userId === reply.repliedUser) {
            repliesOfAuthor.push(reply)
            continue
        }
        otherReplies.push(reply)
    }
    // Send to redis
    cachedPostWrite.writeMulti(replies, multi)
    multi.sAdd(repliersRedisKey(post.id), replies.map(e => e.userId))
    if (otherReplies.length > 0) multi.sAdd(repliesRedisKey(post.id), otherReplies.map(e => e.id))
    if (repliesOfAuthor.length > 0) multi.sAdd(repliesOfAuthorRedisKey(post.id), repliesOfAuthor.map(e => e.id))
}

export function deleteReplyCache(replies: Post[], multi: RedisMulti) {

}

function updateCommentSectionTTLs(multi: RedisMulti, postId: string, createdAt: Date) {
    const ttl = getMainFeedTTL(createdAt, commentSectionTTL)
    multi.expire(repliesExistRedisKey(postId), ttl)
    multi.expire(repliesRedisKey(postId), ttl)
    multi.expire(repliesOfAuthorRedisKey(postId), ttl)
    multi.expire(repliersRedisKey(postId), ttl)
}