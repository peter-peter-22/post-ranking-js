import { createMentionNotifications, createReplyNotification } from "../../db/controllers/notifications/createNotification"
import { Post } from "../../db/schema/posts"
import { processEngagementUpdates } from "../../userActions/posts/engagements/updates"
import { PreparedPost } from "../../userActions/posts/preparePost"
import { redisClient } from "../connect"
import { writeReplyCache } from "../replies"
import { updateEngagementHistory } from "../users/engagementHistory"
import { cachedPostWrite, postContentRedisKey } from "./read"

export async function handlePostInsert({ post, replied }: PreparedPost) {
    const multi = redisClient.multi()
    if (replied) writeReplyCache([post], replied, multi)
    if (post.replyingTo) redisClient.hIncrBy(postContentRedisKey(post.replyingTo), "replyCount", 1)
    await Promise.all([
        post.replyingTo ? multi.exec() : undefined,
        post.replyingTo && post.repliedUser ? createReplyNotification(post.repliedUser, post.replyingTo, post.createdAt, post.id) : undefined,
        post.replyingTo && post.repliedUser ? updateEngagementHistory(post.userId, [{ posterId: post.repliedUser, addReplies: 1 }]) : undefined,
        cachedPostWrite.write([post]),
        createMentionNotifications(post.mentions, post.id, post.createdAt, post.userId),
        processEngagementUpdates(post.userId, {
            replies: [{
                postId: post.id,
                posterId: post.userId,
                date: post.createdAt,
                value: true
            }]
        }),
    ])
}

export async function handlePostDelete(post: Post) {
    await Promise.all([
        post.replyingTo ? redisClient.hIncrBy(postContentRedisKey(post.replyingTo), "replyCount", -1) : undefined,
        post.replyingTo && post.repliedUser ? updateEngagementHistory(post.userId, [{ posterId: post.repliedUser, addReplies: 1 }]) : undefined,
        redisClient.del(postContentRedisKey(post.id)),
        processEngagementUpdates(post.userId, {
            replies: [{
                postId: post.id,
                posterId: post.userId,
                date: post.createdAt,
                value: false
            }]
        })

    ])
}