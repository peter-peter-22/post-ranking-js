import { and, eq, inArray, sql } from "drizzle-orm"
import { db } from "../../../../db"
import { likes } from "../../../../db/schema/likes"
import { selectTargetPosts } from "../../common"
import { processEngagementUpdates } from "../updates"

export async function addLikes(userId: string, postIds: string[]) {
    if (postIds.length === 0) return
    const targetPosts = selectTargetPosts(postIds)
    const updated = await db
        .insert(likes)
        .select(db
            .select({
                postId: targetPosts.id,
                userId: sql`${userId}`.as("user_id"),
                posterId: targetPosts.userId,
                createdAt: sql`now()`.as("created_at"),
            })
            .from(targetPosts)
        )
        .onConflictDoNothing()
        .returning()
    await processEngagementUpdates(userId, {
        likes: updated.map(e => ({
            postId: e.postId,
            value: true,
            posterId: e.posterId,
            date: e.createdAt
        }))
    })
}

export async function removeLikes(userId: string, postIds: string[]) {
    if (postIds.length === 0) return
    const updated = await db
        .delete(likes)
        .where(and(
            eq(likes.userId, userId),
            inArray(likes.postId, postIds)
        ))
        .returning()
    await processEngagementUpdates(userId, {
        likes: updated.map(e => ({
            postId: e.postId,
            value: false,
            posterId: e.posterId,
            date: e.createdAt
        }))
    })

} 