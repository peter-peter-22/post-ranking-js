import { inArray } from "drizzle-orm"
import { db } from "../../db"
import { Post, posts } from "../../db/schema/posts"
import { redisClient } from "../connect"
import { userFollowListRedisKey } from "../users/follows"
import { cachedPostWrite } from "."
import { RedisModules } from "redis"
import { getMainFeedTTL, postTTL, RedisMulti } from "../common"
import { getMainFeed } from "../../posts/forYou"

export function repliersRedisKey(postId: string) {
    return `post:${postId}:replies:users`
}

/** Try to get the followed comment counts from redis
 ** Does not checks cache existence.
 */
export async function getFollowedReplierCounts(userId: string, targetPosts: Post[]) {
    const multi = redisClient.multi()
    for (const post of targetPosts) {
        multi.sInterCard([repliersRedisKey(post.id), userFollowListRedisKey(userId)])
    }
    return await multi.exec() as number[]
}

/** Cache the provided replies and their calculated metadata. */
export function cachedReplyWrite(replies: Post[], repliedPost: Post, multi: RedisMulti) {
    const ttl = getMainFeedTTL(repliedPost.createdAt, postTTL)
    // Cache the content of the replies
    cachedPostWrite(replies, multi, ttl)
    // Cache the replying users of each post
    const replyingUsers = [...new Set(replies.map(r => r.userId))]
    const repliersKey = repliersRedisKey(repliedPost.id)
    multi.sAdd(repliersKey, replyingUsers)
    multi.expire(repliersKey, ttl)
}

/** Fetch the replies from the db and group them by replied post id. */
export async function getReplies(postIds: string[]) {
    // Get the replies from the db
    const replies = await db
        .select()
        .from(posts)
        .where(inArray(posts.replyingTo, postIds))

    // Group by replied post id
    const postReplyMap = new Map<string, Post[]>()
    for (const post of replies) {
        if (!post.replyingTo) continue
        let repliesOfPost = postReplyMap.get(post.replyingTo)
        if (!repliesOfPost) {
            repliesOfPost = []
            postReplyMap.set(post.replyingTo, repliesOfPost)
        }
        repliesOfPost.push(post)
    }

    // Return the reply map
    return postReplyMap
}