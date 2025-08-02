import { EngagementActionResult, ProcessContext } from "."
import { viewCountJobs } from "../../../../redis/jobs/categories/viewCount"
import { postContentRedisKey } from "../../../../redis/postContent"

export async function setViews(userId: string, actions: EngagementActionResult[], ctx: ProcessContext) {
    for (const action of actions) {
        ctx.redis.hIncrBy(postContentRedisKey(action.postId), "viewCount", action.value ? 1 : -1)
        ctx.jobs.push(viewCountJobs.returnJob({ data: action.postId }))
    }
}