import { and, eq, inArray } from "drizzle-orm"
import { db } from "../../../../db"
import { clicks, ClicksToInsert } from "../../../../db/schema/clicks"
import { HttpError } from "../../../../middlewares/errorHandler"
import { cachedPosts } from "../../../../redis/postContent"
import { processEngagementUpdates } from "../updates"

export async function addClicks(userId: string, postIds: string[]) {
    if (postIds.length === 0) return
    const targetPosts = await cachedPosts.read(postIds)
    const updated = await db
        .insert(clicks)
        .values(postIds.map(postId => ({ userId, postId }) as ClicksToInsert))
        .onConflictDoNothing()
        .returning()
    await processEngagementUpdates(userId, {
        clicks: updated.map(e => {
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

export async function removeClicks(userId: string, postIds: string[]) {
    if (postIds.length === 0) return
    const targetPosts = await cachedPosts.read(postIds)
    const updated = await db
        .delete(clicks)
        .where(and(
            eq(clicks.userId, userId),
            inArray(clicks.postId, postIds)
        ))
        .returning()
    await processEngagementUpdates(userId, {
        clicks: updated.map(e => {
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