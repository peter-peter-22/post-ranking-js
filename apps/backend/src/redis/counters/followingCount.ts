import { incrementRedisCounter } from "../../jobs/common";
import { standardJobs } from "../../jobs/queue";

export function userFollowingCountRedis(userId: string) {
    return`user:${userId}:counters:following`
}

export async function incrementFollowingCounter(userId: string, add: number) {
    await Promise.all([
        incrementRedisCounter(userFollowingCountRedis(userId), add),
        standardJobs.addJob("followingCount", userId)
    ])
}