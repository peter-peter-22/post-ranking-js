import { incrementRedisCounter } from "./common";
import { standardJobs } from "./updates";

export function userFollowerCountRedis(userId: string) {
    return`user:${userId}:counters:follower`
}

export async function incrementFollowerCounter(userId: string, add: number) {
    await Promise.all([
        incrementRedisCounter(userFollowerCountRedis(userId), add),
        standardJobs.addJob("followerCount", userId)
    ])
}