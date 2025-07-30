import { and, eq } from "drizzle-orm"
import { db } from "../../db"
import { posts } from "../../db/schema/posts"
import { User } from "../../db/schema/users"
import { HttpError } from "../../middlewares/errorHandler"
import { handlePostDelete, handlePostInsert } from "../../redis/postContent/write"

export async function deletePost(postId: string, user: User) {
    // Update the deleted state of the post
    const [deleted] = await db
        .update(posts)
        .set({ deleted: true })
        .where(and(
            eq(posts.id, postId),
            eq(posts.userId, user.id)
        ))
        .returning()
    // If it was deleted
    if (!deleted) throw new HttpError(400, "This post does not exists or it is not your post.")
    // Update cache
    await handlePostDelete(deleted)
    return deleted
}

export async function restorePost(postId: string, user: User) {
    // Update the deleted state of the post
    const [restored] = await db
        .update(posts)
        .set({ deleted: false })
        .where(and(
            eq(posts.id, postId),
            eq(posts.userId, user.id)
        ))
        .returning()
    // Update cache
    await handlePostInsert({post:restored})
    // Check if it was restored
    if (!restored) throw new HttpError(400, "This post does not exists or it is not your post.")
        return restored
}