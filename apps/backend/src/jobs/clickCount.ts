import { incrementRedisCounter } from "./common";
import { scheduleEngagementHistoryUpdate } from "./engagementHistory";
import { standardJobs } from "./updates";

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