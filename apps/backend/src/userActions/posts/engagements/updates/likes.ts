import { EngagementActionResult, ProcessContext } from "."
import { createLikeNotification } from "../../../../db/controllers/notifications/createNotification"
import { likeCountJobs } from "../../../../redis/jobs/categories/likeCount"
import { postContentRedisKey } from "../../../../redis/postContent"

export  function setLikes(userId: string, actions: EngagementActionResult[], ctx: ProcessContext) {
    for (const action of actions) {
        ctx.redis.hIncrBy(postContentRedisKey(action.postId), "likeCount", action.value ? 1 : -1)
        ctx.jobs.push(likeCountJobs.returnJob({ data: action.postId }))
        if (action.value) ctx.promises.push(createLikeNotification(userId, action.postId, action.date))
    }
}