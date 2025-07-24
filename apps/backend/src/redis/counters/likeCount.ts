import { incrementRedisCounter } from "../../jobs/common";
import { scheduleEngagementHistoryUpdate } from "../../jobs/engagementHistory";
import { standardJobs } from "../../jobs/queue";

export function postLikeCounterRedis(postId: string) {
    return`post:${postId}:counters:viewcount`
}

export async function incrementLikeCounter(postId: string, userId: string, add: number) {
    await Promise.all([
        incrementRedisCounter(postLikeCounterRedis(postId), add),
        standardJobs.addJob("likeCount", postId),
        scheduleEngagementHistoryUpdate(userId),
    ])
}