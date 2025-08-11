import { EngagementActionResult, ProcessContext } from "."
import { createReplyNotification } from "../../../../db/controllers/notifications/createNotification"
import { postContentRedisKey } from "../../../../redis/postContent"

export function setReplies(userId: string, actions: EngagementActionResult[], ctx: ProcessContext) {
    for (const action of actions) {
        ctx.redis.hIncrBy(postContentRedisKey(action.post.id), "replyCount", action.value ? 1 : -1)
        if (action.value) ctx.promises.push(createReplyNotification(action.post.userId, action.post.id, action.date, userId))
    }
}