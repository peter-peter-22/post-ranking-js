import { cachedPostWrite, postContentRedisKey } from "."
import { processEngagementUpdates } from "../../userActions/posts/engagements/updates"
import { PreparedPost } from "../../userActions/posts/preparePost"
import { redisClient } from "../connect"
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