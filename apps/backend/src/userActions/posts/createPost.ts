import { eq } from "drizzle-orm";
import { db } from "../../db";
import { addMedia } from "../../db/controllers/pendingUploads/updateMedia";
import { Post, posts, PostToInsert } from "../../db/schema/posts";
import { chunkedInsert } from "../../db/utils/chunkedInsert";
import { handlePostInsert } from "../../redis/postContent/write";
import { PostToFinalize } from "../../routes/userActions/posts/createPost";
import { prepareAnyPost, preparePosts } from "./preparePost";
import { HttpError } from "../../middlewares/errorHandler";

/** Insert posts to the database. */
export async function bulkInsertPosts(postsToInsert: PostToInsert[]) {
    // Calculate metadata
    postsToInsert = await preparePosts(postsToInsert)
    // Insert to db and return
    console.log(`Inserting posts`)
    const inserted: Post[] = []
    await db.transaction(async tx => {
        await chunkedInsert(
            postsToInsert,
            async (rows) => {
                const res = await tx
                    .insert(posts)
                    .values(rows)
                    .onConflictDoNothing()
                    .returning()
                inserted.push(...res)
            }
        )
    })
    console.log(`Posts inserted`)
    return inserted
}

export async function insertPost(post: PostToInsert) {
    const preparedPost = await prepareAnyPost(post)
    const [created] = await db
        .insert(posts)
        .values(preparedPost.post)
        .returning()
    await handlePostInsert({ post: created, replied: preparedPost.replied })
    return created
}

/** Validate and finalize a post and it's media files. */
export async function finalizePost(post: PostToFinalize, userId: string) {
    console.log("Finalizing post..")
    // Check if the finalized post is valid
    const [previousPost] = await db
        .select({
            userId: posts.userId,
            pending: posts.pending
        })
        .from(posts)
        .where(eq(posts.id, post.id))
    if (previousPost.userId !== userId) throw new HttpError(401, "This is not your post")
    if (previousPost.pending !== true) throw new HttpError(400, "This post is not pending")
    // Finalize media files, and check if they are valid
    if (post.media) await addMedia(post.media)
    // Prepare the post to insert
    const preparedPost = await prepareAnyPost(post)
    // Exclude the id from the update to avoid error
    const { id, ...valuesToUpdate } = preparedPost.post
    // Update the pending post to set it's values and remove the pending status
    const [created] = await db
        .update(posts)
        .set({ ...valuesToUpdate, pending: false })
        .where(eq(posts.id, post.id))
        .returning()
    await handlePostInsert(preparedPost)
    return created
}