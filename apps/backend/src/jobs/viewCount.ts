import { incrementRedisCounter } from "./common";
import { standardJobs } from "./updates";

export function postViewCounterRedis(postId: string) {
    return `viewCount/${postId}`
}

export async function incrementViewCounter(postId: string, add: number) {
    await Promise.all([
        incrementRedisCounter(postViewCounterRedis(postId), add),
        standardJobs.addJob("viewCount", postId)
    ])
}