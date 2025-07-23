import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db";
import { createLikeNotification } from "../../db/controllers/notifications/createNotification";
import { likes } from "../../db/schema/likes";
import { incrementLikeCounter } from "../../jobs/likeCount";
import { selectTargetPost } from "./common";

export async function likePost(postId: string, userId: string, value: boolean) {
    // Handle changes in the DB
    if (value) {
        const [created] = await createLike(postId, userId);
        // Create notification if the used didn't liked his own post
        if (created && created.posterId !== userId) 
            await createLikeNotification(created.posterId, created.postId,created.createdAt)
    }
    else await deleteLike(postId, userId);
    // Update counter
    await incrementLikeCounter(postId, userId, value ? 1 : -1);
}

async function createLike(postId: string, userId: string) {
    const targetPost = selectTargetPost(postId)
    // Insert like into the DB
    return await db
        .insert(likes)
        .select(db
            .select({
                postId: sql`${postId}`.as("postId"),
                userId: sql`${userId}`.as("user_id"),
                posterId: targetPost.userId,
                createdAt: sql`now()`.as("created_at"),
            })
            .from(selectTargetPost(postId))
        )
        .onConflictDoNothing()
        .returning()
}

async function deleteLike(postId: string, userId: string) {
    // Delete the like from the DB
    await db
        .delete(likes)
        .where(and(
            eq(likes.userId, userId),
            eq(likes.postId, postId)
        ))
}