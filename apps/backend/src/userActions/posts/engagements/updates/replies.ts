import { EngagementActionResult, ProcessContext } from "."
import { createReplyNotification } from "../../../../db/controllers/notifications/createNotification"
import { replyCountJobs } from "../../../../redis/jobs/categories/replyCount"
import { postContentRedisKey } from "../../../../redis/postContent"

export  function setReplies(userId: string, actions: EngagementActionResult[], ctx: ProcessContext) {
    for (const action of actions) {
        ctx.redis.hIncrBy(postContentRedisKey(action.postId), "replyCount", action.value ? 1 : -1)
        ctx.jobs.push(replyCountJobs.returnJob({ data: action.postId }))
        if (action.value) ctx.promises.push(createReplyNotification(userId, action.postId, action.date, action.posterId))
    }
}