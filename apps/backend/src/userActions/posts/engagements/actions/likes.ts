import { and, eq, inArray } from "drizzle-orm"
import { db } from "../../../../db"
import { likes, LikeToInsert } from "../../../../db/schema/likes"
import { HttpError } from "../../../../middlewares/errorHandler"
import { cachedPosts } from "../../../../redis/postContent"
import { processEngagementUpdates } from "../updates"

export async function addLikes(userId: string, postIds: string[]) {
    if (postIds.length === 0) return
    const targetPosts = await cachedPosts.read(postIds)
    const updated = await db
        .insert(likes)
        .values(postIds.map(postId => ({ userId, postId }) as LikeToInsert))
        .onConflictDoNothing()
        .returning()
    await processEngagementUpdates(userId, {
        likes: updated.map(e => {
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

export async function removeLikes(userId: string, postIds: string[]) {
    if (postIds.length === 0) return
    const targetPosts = await cachedPosts.read(postIds)
    const updated = await db
        .delete(likes)
        .where(and(
            eq(likes.userId, userId),
            inArray(likes.postId, postIds)
        ))
        .returning()
    await processEngagementUpdates(userId, {
        likes: updated.map(e => {
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