import { incrementRedisCounter } from "../../jobs/common";
import { scheduleEngagementHistoryUpdate } from "../../jobs/engagementHistory";
import { standardJobs } from "../../jobs/queue";

export function postClickCounterRedis(postId: string) {
    return `post:${postId}:counters:click`
}

export async function incrementClickCounter(postId: string, userId: string, add: number) {
    await Promise.all([
        incrementRedisCounter(postClickCounterRedis(postId), add),
        standardJobs.addJob("clickCount", postId),
        scheduleEngagementHistoryUpdate(userId)
    ])
}