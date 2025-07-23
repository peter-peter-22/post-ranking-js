import { incrementRedisCounter } from "./common";
import { standardJobs } from "./updates";

export function postViewCounterRedis(postId: string) {
    return `post:${postId}:counters:view`
}

export async function incrementViewCounter(postId: string, add: number) {
    await Promise.all([
        incrementRedisCounter(postViewCounterRedis(postId), add),
        standardJobs.addJob("viewCount", postId)
    ])
}