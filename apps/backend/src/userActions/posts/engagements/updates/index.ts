import { Post } from "../../../../db/schema/posts"
import { RedisMulti } from "../../../../redis/common"
import { redisClient } from "../../../../redis/connect"
import { jobQueue, JobToAdd } from "../../../../redis/jobs/queue"
import { EngagementUpdates, updateEngagementHistory } from "../../../../redis/users/engagementHistory"
import { setClicks } from "./clicks"
import { setLikes } from "./likes"
import { setReplies } from "./replies"
import { setViews } from "./views"

export type EngagementActionResult = {
    value: boolean,
    post: Post,
    date: Date
}

export type ProcessContext = { redis: RedisMulti, jobs: JobToAdd[], promises: Promise<void>[] }

/** Handle counters and notifications after engagements occur.
 */
export async function processEngagementUpdates(
    actorId: string,
    actions: {
        likes?: EngagementActionResult[],
        replies?: EngagementActionResult[],
        clicks?: EngagementActionResult[],
        views?: EngagementActionResult[]
    }
) {
    const ctx: ProcessContext = { redis: redisClient.multi(), jobs: [], promises: [] }

    if (actions.likes) {
        setLikes(actorId, actions.likes, ctx)
    }
    if (actions.clicks) {
        setClicks(actorId, actions.clicks, ctx)
    }
    if (actions.views) {
        setViews(actorId, actions.views, ctx)
    }
    if (actions.replies) {
        setReplies(actorId, actions.replies, ctx)
    }

    updateEngagementHistory(actorId, aggregateEngagements(actions), ctx)

    await Promise.all([
        ctx.jobs.length > 0 ? jobQueue.addBulk(ctx.jobs) : undefined,
        ctx.redis.exec(),
        ...ctx.promises
    ])
}

function aggregateEngagements(actions: {
    likes?: EngagementActionResult[],
    replies?: EngagementActionResult[],
    clicks?: EngagementActionResult[],
    views?: EngagementActionResult[]
}) {
    const updates = new Map<string, EngagementUpdates>()

    const getCounters = (userId: string) => {
        let myCounts = updates.get(userId)
        if (!myCounts) {
            myCounts = {
                likes: 0,
                replies: 0,
                clicks: 0,
                publisherId: userId
            }
        }
        updates.set(userId, myCounts)
        return myCounts
    }

    if (actions.likes) for (const like of actions.likes) {
        getCounters(like.post.userId).likes++
    }
    if (actions.replies) for (const reply of actions.replies) {
        getCounters(reply.post.userId).replies++
    }
    if (actions.clicks) for (const click of actions.clicks) {
        getCounters(click.post.userId).clicks++
    }
    return [...updates.values()]
}