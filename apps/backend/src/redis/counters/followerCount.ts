import { redisClient } from "../connect";
import { standardJobs } from "../jobs/queue";
import { userContentRedisKey } from "../users/read";

export async function incrementFollowerCounter(userId: string, add: number) {
    await Promise.all([
        redisClient.hIncrBy(userContentRedisKey(userId), "followerCount", add),
        standardJobs.addJob({ category: "followerCount", data: userId, key: userId })
    ])
}