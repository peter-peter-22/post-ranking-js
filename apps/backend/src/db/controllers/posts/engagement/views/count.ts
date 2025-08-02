import { eq } from "drizzle-orm";
import { db } from "../../../..";
import { redisClient } from "../../../../../redis/connect";
import { posts } from "../../../../schema/posts";
import { views } from "../../../../schema/views";
import { postContentRedisKey } from "../../../../../redis/postContent";

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
    await redisClient.hSet(postContentRedisKey(postId), "viewCount", updated.viewCount.toString())
}