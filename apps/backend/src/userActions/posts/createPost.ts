import { eq } from "drizzle-orm";
import { db } from "../../db";
import { addMedia } from "../../db/controllers/pendingUploads/updateMedia";
import { Post, posts, PostToInsert } from "../../db/schema/posts";
import { chunkedInsert } from "../../db/utils/chunkedInsert";
import { handlePostInsert } from "../../redis/postContent/write";
import { PostToFinalize } from "../../routes/userActions/posts/createPost";
import { prepareAnyPost, preparePosts } from "./preparePost";

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
    post = await prepareAnyPost(post)
    const [created] = await db
        .insert(posts)
        .values(post)
        .returning()
    await handlePostInsert(created)
    return created
}

/** Validate and finalize a post and it's media files. */
export async function finalizePost(post: PostToFinalize) {
    console.log("Finalizing post..")
    // Finalize media files, and check if they are valid
    if (post.media) await addMedia(post.media)
    // Prepare the post to insert
    const postToInsert = await prepareAnyPost(post)
    // Exclude the id from the update to avoid error
    const { id, ...valuesToUpdate } = postToInsert
    // Update the pending post to set it's values and remove the pending status
    const [created] = await db
        .update(posts)
        .set({ ...valuesToUpdate, pending: false })
        .where(eq(posts.id, post.id))
        .returning()
    await handlePostInsert(created)
    return created
}