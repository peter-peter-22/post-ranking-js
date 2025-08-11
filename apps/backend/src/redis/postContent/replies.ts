import { inArray } from "drizzle-orm"
import { postContentRedisKey, postHsetSchema } from "."
import { db } from "../../db"
import { Post, posts } from "../../db/schema/posts"
import { RedisMulti } from "../common"
import { redisClient } from "../connect"
import { userFollowingRedisKey } from "../users/follows"

export function repliersRedisKey(postId: string) {
    return `post:${postId}:replies:users`
}

/** Try to get the followed comment counts from redis
 ** Does not checks cache existence.
 */
export async function getFollowedReplierCounts(userId: string, targetPosts: Post[]) {
    const multi = redisClient.multi()
    for (const post of targetPosts) {
        multi.sInterCard([repliersRedisKey(post.id), userFollowingRedisKey(userId)])
    }
    return await multi.exec() as number[]
}

/** Cache the provided replies and their calculated metadata.
 ** Does not checks for cache exitence.
 */
export function cachedReplyWrite(replies: Post[], repliedPost: Post, multi: RedisMulti) {
    // Cache the content of the replies
    for (const reply of replies) {
        const key = postContentRedisKey(reply.id)
        multi.hSet(
            key,
            postHsetSchema.serialize(reply)
        );
    }
    // Cache the replying users of each post
    const replyingUsers = [...new Set(replies.map(r => r.userId))]
    const repliersKey = repliersRedisKey(repliedPost.id)
    multi.sAdd(repliersKey, replyingUsers)
}

/** Fetch the replies (including indirect) from the db and group them by replied post id. */
export async function getReplies(newPosts: Post[]) {
    // Get the replies from the db
    const replies = await db
        .select()
        .from(posts)
        .where(inArray(posts.rootPostId, newPosts.map(p => p.id)))

    // Group by replied post id
    const postReplyMap = new Map<string, Post[]>()
    for (const post of replies) {
        if (!post.rootPostId) continue
        let repliesOfPost = postReplyMap.get(post.rootPostId)
        if (!repliesOfPost) {
            repliesOfPost = []
            postReplyMap.set(post.rootPostId, repliesOfPost)
        }
        repliesOfPost.push(post)
    }

    // Return the reply map
    return postReplyMap
}