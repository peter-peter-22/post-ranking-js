import { incrementRedisCounter } from "../../jobs/common";
import { standardJobs } from "../../jobs/queue";

export function userFollowerCountRedis(userId: string) {
    return`user:${userId}:counters:follower`
}

export async function incrementFollowerCounter(userId: string, add: number) {
    await Promise.all([
        incrementRedisCounter(userFollowerCountRedis(userId), add),
        standardJobs.addJob("followerCount", userId)
    ])
}