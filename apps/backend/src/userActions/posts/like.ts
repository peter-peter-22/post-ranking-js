import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db";
import { createLikeNotification } from "../../db/controllers/notifications/createNotification";
import { likes } from "../../db/schema/likes";
import { redisClient } from "../../redis/connect";
import { likeCountJobs } from "../../redis/jobs/categories/likeCount";
import { postContentRedisKey } from "../../redis/postContent/read";
import { updateEngagementHistory } from "../../redis/users/engagementHistory";
import { selectTargetPost } from "./common";
import { jobQueue } from "../../redis/jobs/queue";
import { userEmbeddingJobs } from "../../redis/jobs/categories/userEmbedding";

export async function likePost(postId: string, userId: string, value: boolean) {
    // Handle changes in the DB
    const [updated] = await value ? (
        await createLike(postId, userId)
    ) : (
        await deleteLike(postId, userId)
    )
    const add = value ? 1 : -1
    if (updated) {
        // Update redis
        await Promise.all([
            // Schedule jobs to update counters
            jobQueue.addBulk([
                likeCountJobs.returnJob({ data: postId }),
                userEmbeddingJobs.returnJob({ data: userId })
            ]),
            // Increment counter
            redisClient.hIncrBy(postContentRedisKey(postId), "likeCount", add),
            // Update engagement history
            updateEngagementHistory(userId, [{ posterId: updated.posterId, addLikes: add }]),
            // Create notification if needed
            value === true && updated.posterId !== userId ? createLikeNotification(updated.posterId, updated.postId, updated.createdAt) : undefined,
        ])
    }
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
    return await db
        .delete(likes)
        .where(and(
            eq(likes.userId, userId),
            eq(likes.postId, postId)
        ))
        .returning()
}

