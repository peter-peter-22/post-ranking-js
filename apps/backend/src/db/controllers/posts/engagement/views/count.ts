import { eq } from "drizzle-orm";
import { db } from "../../../..";
import { postViewCounterRedis } from "../../../../../jobs/viewCount";
import { redisClient } from "../../../../../redis/connect";
import { posts } from "../../../../schema/posts";
import { views } from "../../../../schema/views";

/**Recalculate the view count of a post. */
export async function updateViewCounts(postId: string) {
    const [updated] = await db.update(posts)
        .set({
            viewCount: db.$count(views, eq(posts.id, views.postId))
        })
        .where(
            eq(posts.id, postId)
        )
        .returning({ viewCount: posts.viewCount })
    if (!updated) return
    // Update the counter in Redis
    await redisClient.set(postViewCounterRedis(postId), updated.viewCount)
}