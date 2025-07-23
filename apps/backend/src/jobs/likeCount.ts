import { incrementRedisCounter } from "./common";
import { scheduleEngagementHistoryUpdate } from "./engagementHistory";
import { standardJobs } from "./updates";

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