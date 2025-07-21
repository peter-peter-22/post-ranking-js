import { aliasedTable, eq } from "drizzle-orm";
import { db } from "../..";
import { postReplyCounterRedis } from "../../../jobs/replyCount";
import { redisClient } from "../../../redis/connect";
import { posts } from "../../schema/posts";

export const postsToUpdate = aliasedTable(posts, "selected_posts")

/**Recalculate the reply count of a post. */
export async function updateReplyCount(postId: string) {
    const [updated] = await db.update(postsToUpdate)
        .set({
            replyCount: db.$count(posts, eq(postsToUpdate.id, posts.replyingTo))
        })
        .where(
            eq(postsToUpdate.id, postId)
        )
        .returning({ replyCount: postsToUpdate.replyCount })
    if (!updated) return
    // Update the counter in Redis
    await redisClient.set(postReplyCounterRedis(postId), updated.replyCount)
}