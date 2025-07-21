import { eq } from "drizzle-orm";
import { db } from "../../..";
import { userFollowingCountRedis } from "../../../../jobs/followingCount";
import { redisClient } from "../../../../redis/connect";
import { follows } from "../../../schema/follows";
import { users } from "../../../schema/users";
import { userFollowerCountRedis } from "../../../../jobs/followerCount";

/**Recalculate the follower count of a user. */
export async function updateFollowerCount(userId: string) {
    const [updated] = await db.update(users)
        .set({
            followerCount: db.$count(follows, eq(follows.followedId, users.id))
        })
        .where(
            eq(users.id, userId)
        )
        .returning({ followerCount: users.followerCount })
    if (!updated) return
    // Update the counter in Redis
    await redisClient.set(userFollowerCountRedis(userId), updated.followerCount)
}

/**Recalculate the following count of a user. */
export async function updateFollowingCount(userId: string) {
    const [updated] = await db.update(users)
        .set({
            followingCount: db.$count(follows, eq(follows.followerId, users.id))
        })
        .where(
            eq(users.id, userId)
        )
        .returning({ followingCount: users.followingCount })
    if (!updated) return
    // Update the counter in Redis
    await redisClient.set(userFollowingCountRedis(userId), updated.followingCount)
}

/** Update all follower and following counts. */
export async function updateAllFollowCounts() {
    await db.update(users)
        .set({
            followerCount: db.$count(follows, eq(follows.followedId, users.id)),
            followingCount: db.$count(follows, eq(follows.followerId, users.id))
        })
}