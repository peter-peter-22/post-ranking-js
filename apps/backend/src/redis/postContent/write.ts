import { createMentionNotifications, createReplyNotification } from "../../db/controllers/notifications/createNotification"
import { Post } from "../../db/schema/posts"
import { redisClient } from "../connect"
import { updateEngagementHistory } from "../users/engagementHistory"
import { cachedPostWrite, postContentRedisKey } from "./read"

export async function handlePostInsert(post: Post) {
    await Promise.all([
        post.replyingTo ? redisClient.hIncrBy(postContentRedisKey(post.replyingTo), "replyCount", 1) : undefined,
        post.replyingTo && post.repliedUser ? createReplyNotification(post.repliedUser, post.replyingTo, post.createdAt, post.id) : undefined,
        post.replyingTo && post.repliedUser ? updateEngagementHistory(post.userId, [{ posterId: post.repliedUser, addReplies: 1 }]) : undefined,
        cachedPostWrite.write([post]),
        createMentionNotifications(post.mentions, post.id, post.createdAt, post.userId),
    ])
}