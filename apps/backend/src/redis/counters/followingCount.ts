import { redisClient } from "../connect";
import { standardJobs } from "../jobs/queue";
import { userContentRedisKey } from "../users/read";

export async function incrementFollowingCounter(userId: string, add: number) {
    await Promise.all([
        redisClient.hIncrBy(userContentRedisKey(userId), "followingCount", add),
        standardJobs.addJob({ category: "followingCount", data: userId, key: userId })
    ])
}