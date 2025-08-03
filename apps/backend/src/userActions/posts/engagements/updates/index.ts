import { RedisMulti } from "../../../../redis/common"
import { redisClient } from "../../../../redis/connect"
import { jobQueue, JobToAdd } from "../../../../redis/jobs/queue"
import { setClicks } from "./clicks"
import { setLikes } from "./likes"
import { setReplies } from "./replies"
import { setViews } from "./views"

export type EngagementActionResult = {
    postId: string
    value: boolean,
    posterId: string,
    date: Date
}

export type ProcessContext = { redis: RedisMulti, jobs: JobToAdd[], promises: Promise<void>[] }

/** Process engagement updates.
 * 
 */
export async function processEngagementUpdates(
    userId: string,
    actions: {
        likes?: EngagementActionResult[],
        replies?: EngagementActionResult[],
        clicks?: EngagementActionResult[],
        views?: EngagementActionResult[]
    }
) {
    const ctx: ProcessContext = { redis: redisClient.multi(), jobs: [], promises: [] }

    if (actions.likes) {
        setLikes(userId, actions.likes, ctx)
    }
    if (actions.clicks) {
        setClicks(userId, actions.clicks, ctx)
    }
    if (actions.views) {
        setViews(userId, actions.views, ctx)
    }
    if (actions.replies) {
        setReplies(userId, actions.replies, ctx)
    }

    // TODO: update engagement histories

    await Promise.all([
        jobQueue.addBulk(ctx.jobs),
        ctx.redis.exec(),
        ...ctx.promises
    ])
}
