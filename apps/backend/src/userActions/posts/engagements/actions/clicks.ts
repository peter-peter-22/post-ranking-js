import { and, eq, inArray, sql } from "drizzle-orm"
import { db } from "../../../../db"
import { clicks } from "../../../../db/schema/clicks"
import { selectTargetPosts } from "../../common"
import { processEngagementUpdates } from "../updates"

export async function addClicks(userId: string, postIds: string[]) {
    if (postIds.length === 0) return
    const targetPosts = selectTargetPosts(postIds)
    const updated = await db
        .insert(clicks)
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
        clicks: updated.map(e => ({
            postId: e.postId,
            value: true,
            posterId: e.posterId,
            date: e.createdAt
        }))
    })
}

export async function removeClicks(userId: string, postIds: string[]) {
        if (postIds.length === 0) return
    const updated = await db
        .delete(clicks)
        .where(and(
            eq(clicks.userId, userId),
            inArray(clicks.postId, postIds)
        ))
        .returning()
    await processEngagementUpdates(userId, {
        clicks: updated.map(e => ({
            postId: e.postId,
            value: false,
            posterId: e.posterId,
            date: e.createdAt
        }))
    })

} 