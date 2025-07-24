import { incrementRedisCounter } from "../../jobs/common";
import { scheduleEngagementHistoryUpdate } from "../../jobs/engagementHistory";
import { standardJobs } from "../../jobs/queue";

export function postReplyCounterRedis(postId: string) {
    return `post:${postId}:counters:reply`
}

export async function incrementReplyCounter(postId: string, userId: string, add: number) {
    await Promise.all([
        incrementRedisCounter(postReplyCounterRedis(postId), add),
        standardJobs.addJob("replyCount", postId),
        scheduleEngagementHistoryUpdate(userId)
    ])
}