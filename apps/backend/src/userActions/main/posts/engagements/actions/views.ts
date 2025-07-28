import { and, eq, inArray, sql } from "drizzle-orm"
import { userActions } from "../../.."
import { db } from "../../../../../db"
import { views } from "../../../../../db/schema/views"
import { selectTargetPosts } from "../../../../posts/common"

export async function addViews(userId: string, postIds: string[]) {
    if (postIds.length === 0) return
    const targetPosts = selectTargetPosts(postIds)
    const updated = await db
        .insert(views)
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
    await userActions.posts.engagements.processUpdates(userId, {
        views: updated.map(e => ({
            postId: e.postId,
            value: true,
            posterId: e.posterId,
            date: e.createdAt
        }))
    })
}

export async function removeViews(userId: string, postIds: string[]) {
    if (postIds.length === 0) return
    const updated = await db
        .delete(views)
        .where(and(
            eq(views.userId, userId),
            inArray(views.postId, postIds)
        ))
        .returning()
    await userActions.posts.engagements.processUpdates(userId, {
        views: updated.map(e => ({
            postId: e.postId,
            value: false,
            posterId: e.posterId,
            date: e.createdAt
        }))
    })

} 