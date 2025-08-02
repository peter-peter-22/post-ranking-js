import { cachedPostWrite, postContentRedisKey } from "."
import { createMentionNotifications, createReplyNotification } from "../../db/controllers/notifications/createNotification"
import { processEngagementUpdates } from "../../userActions/posts/engagements/updates"
import { PreparedPost } from "../../userActions/posts/preparePost"
import { redisClient } from "../connect"
import { updateEngagementHistory } from "../users/engagementHistory"
import { cachedReplyWrite } from "./replies"

/** Handle all cache related operations and notifications of a inserted post. */
export async function handlePostInsert({ post, replied }: PreparedPost) {
    const multi = redisClient.multi()
    if (post.replyingTo && replied) {
        multi.hIncrBy(postContentRedisKey(post.replyingTo), "replyCount", 1)
        cachedReplyWrite([post], replied, multi)
    }
    else
        cachedPostWrite([post], multi)
    await Promise.all([
        multi.exec(),
        post.replyingTo && post.repliedUser ? createReplyNotification(post.repliedUser, post.replyingTo, post.createdAt, post.id) : undefined,
        post.replyingTo && post.repliedUser ? updateEngagementHistory(post.userId, [{ posterId: post.repliedUser, addReplies: 1 }]) : undefined,
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