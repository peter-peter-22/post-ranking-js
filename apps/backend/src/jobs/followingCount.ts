import { incrementRedisCounter } from "./common";
import { standardJobs } from "./updates";

export function userFollowingCountRedis(userId: string) {
    return`user:${userId}:counters:following`
}

export async function incrementFollowingCounter(userId: string, add: number) {
    await Promise.all([
        incrementRedisCounter(userFollowingCountRedis(userId), add),
        standardJobs.addJob("followingCount", userId)
    ])
}