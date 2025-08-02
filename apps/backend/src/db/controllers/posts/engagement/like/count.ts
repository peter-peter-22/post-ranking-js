import { eq } from "drizzle-orm";
import { db } from "../../../..";
import { redisClient } from "../../../../../redis/connect";
import { likes } from "../../../../schema/likes";
import { posts } from "../../../../schema/posts";
import { postContentRedisKey } from "../../../../../redis/postContent";

/** Recalculate the like count on a single post. */
export async function updateLikeCount(postId: string) {
    const [updated] = await db.update(posts)
        .set({
            likeCount: db.$count(likes, eq(posts.id, likes.postId)),
        })
        .where(
            eq(posts.id, postId)
        )
        .returning({ likeCount: posts.likeCount })
    if (!updated) return
    // Update the counter in Redis
    await redisClient.hSet(postContentRedisKey(postId), "likeCount", updated.likeCount.toString())
}