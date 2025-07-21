import { eq } from "drizzle-orm";
import { db } from "../../../..";
import { redisClient } from "../../../../../redis/connect";
import { postLikeCounterRedis } from "../../../../../userActions/posts/like";
import { likes } from "../../../../schema/likes";
import { posts } from "../../../../schema/posts";


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
    await redisClient.set(postLikeCounterRedis(postId), updated.likeCount)
    // TODO: the update of the engagement history and the notifications could be moved here to reduce calls to redis at the cost of 1 minute delay
}