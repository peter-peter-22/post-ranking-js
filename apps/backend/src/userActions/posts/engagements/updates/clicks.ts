import { EngagementActionResult, ProcessContext } from "."
import { clickCountJobs } from "../../../../redis/jobs/categories/clickCount"
import { postContentRedisKey } from "../../../../redis/postContent"

export  function setClicks(userId: string, actions: EngagementActionResult[], ctx: ProcessContext) {
    for (const action of actions) {
        ctx.redis.hIncrBy(postContentRedisKey(action.postId), "clickCount", action.value ? 1 : -1)
        ctx.jobs.push(clickCountJobs.returnJob({ data: action.postId }))
    }
}