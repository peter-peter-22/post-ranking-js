import { and, eq, inArray } from "drizzle-orm"
import { db } from "../../../../db"
import { views, ViewToInsert } from "../../../../db/schema/views"
import { HttpError } from "../../../../middlewares/errorHandler"
import { cachedPosts } from "../../../../redis/postContent"
import { processEngagementUpdates } from "../updates"

export async function addViews(userId: string, postIds: string[]) {
    if (postIds.length === 0) return
    const targetPosts = await cachedPosts.read(postIds)
    const updated = await db
        .insert(views)
        .values(postIds.map(postId => ({ userId, postId }) as ViewToInsert))
        .onConflictDoNothing()
        .returning()
    await processEngagementUpdates(userId, {
        views: updated.map(e => {
            const myPost = targetPosts.get(e.postId)
            if (!myPost) throw new HttpError(404, "This post does not exists")
            return {
                value: true,
                post: myPost,
                date: e.createdAt
            }
        })
    })
}

export async function removeViews(userId: string, postIds: string[]) {
    if (postIds.length === 0) return
    const targetPosts = await cachedPosts.read(postIds)
    const updated = await db
        .delete(views)
        .where(and(
            eq(views.userId, userId),
            inArray(views.postId, postIds)
        ))
        .returning()
    await processEngagementUpdates(userId, {
        views: updated.map(e => {
            const myPost = targetPosts.get(e.postId)
            if (!myPost) throw new HttpError(404, "This post does not exists")
            return {
                value: false,
                post: myPost,
                date: e.createdAt
            }
        })
    })
} 