import { incrementRedisCounter } from "./common";
import { scheduleEngagementHistoryUpdate } from "./engagementHistory";
import { standardJobs } from "./updates";

export function postReplyCounterRedis(postId: string) {
    return `replyCount/${postId}`
}

export async function incrementReplyCounter(postId: string, userId: string, add: number) {
    await Promise.all([
        incrementRedisCounter(postReplyCounterRedis(postId), add),
        standardJobs.addJob("replyCount", postId),
        scheduleEngagementHistoryUpdate(userId)
    ])
}