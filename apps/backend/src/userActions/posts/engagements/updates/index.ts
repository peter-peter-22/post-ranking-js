import { likes } from "../../../../db/schema/likes"
import { RedisMulti } from "../../../../redis/common"
import { redisClient } from "../../../../redis/connect"
import { jobQueue, JobToAdd } from "../../../../redis/jobs/queue"
import { AggregatedEngagements, updateEngagementHistory } from "../../../../redis/users/engagementHistory"
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

/** Process engagement updates in redis.
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

    // TODO add to multi after upgrading
    ctx.promises.push(updateEngagementHistory(userId, aggregateEngagements(actions)))

    await Promise.all([
        jobQueue.addBulk(ctx.jobs),
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

    const updates = new Map<string, AggregatedEngagements>()
    if (actions.likes) for (const like of actions.likes) {
        getCounters(like.posterId).likes++
    }
    if (actions.replies) for (const reply of actions.replies) {
        getCounters(reply.posterId).replies++
    }
    if (actions.clicks) for (const click of actions.clicks) {
        getCounters(click.posterId).clicks++
    }
    return [...updates.values()]
}