import { redisClient } from "../../connect";
import { calculateOnlineFollowers, temporalOnlineFollowersRedisKey, userFollowedPostsRedisKey } from "../../users/follows";
import { jsonJob } from "../jsonJob";

type PostFanoutData = {
    userId: string
    postId: string
}

const batchSize = 1000

export const fanoutPostToFollowers = jsonJob<PostFanoutData>(
    {
        name: "fanoutPostToFollowers",
        handler: async ({ userId, postId }) => {
            await calculateOnlineFollowers(userId)
            const iterator = await redisClient.sScanIterator(temporalOnlineFollowersRedisKey(userId), { COUNT: batchSize });
            const currentBatch: string[] = []
            for await (const followerId of iterator) {
                currentBatch.push(followerId)
                if (currentBatch.length >= batchSize)
                    await processBatch(currentBatch, postId)
            }
            await processBatch(currentBatch, postId)
        }
    },
    (job) => {
        job.key = job.data.userId + "_" + job.data.postId
        return job
    }
)

async function processBatch(currentBatch: string[], postId: string) {
    if (currentBatch.length === 0) return
    const multi = redisClient.multi()
    for (const followerId of currentBatch) {
        multi.sAdd(userFollowedPostsRedisKey(followerId), postId)
    }
    await multi.exec()
}