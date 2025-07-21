import { eq } from "drizzle-orm";
import { db } from "../../../..";
import { postClickCounterRedis } from "../../../../../jobs/clickCount";
import { redisClient } from "../../../../../redis/connect";
import { clicks } from "../../../../schema/clicks";
import { posts } from "../../../../schema/posts";

/**Recalculate the click count of a post */
export async function updateClickCount(postId: string) {
    const [updated] = await db.update(posts)
        .set({
            clickCount: db.$count(clicks, eq(posts.id, clicks.postId))
        })
        .where(
            eq(posts.id, postId)
        )
        .returning({ clickCount: posts.clickCount })
    if (!updated) return
    // Update the counter in Redis
    await redisClient.set(postClickCounterRedis(postId), updated.clickCount)
}