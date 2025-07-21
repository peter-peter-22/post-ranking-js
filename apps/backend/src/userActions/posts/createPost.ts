import { eq } from "drizzle-orm";
import { db } from "../../db";
import { addMedia } from "../../db/controllers/pendingUploads/updateMedia";
import { Post, posts, PostToInsert } from "../../db/schema/posts";
import { chunkedInsert } from "../../db/utils/chunkedInsert";
import { PostToFinalize } from "../../routes/userActions/posts/createPost";
import { prepareAnyPost, preparePosts, prepareReplies } from "./preparePost";

/** Calculate the metadata of posts and insert them into the database. */
export async function createPosts(data: PostToInsert[]) {
    console.log(`Creating ${data.length} posts...`)
    const postsToInsert = await preparePosts(data)
    return await insertPosts(postsToInsert)
}

/** Insert replies into the database. */
export async function createReplies(data: PostToInsert[]) {
    console.log(`Creating ${data.length} replies...`)
    const postsToInsert = await prepareReplies(data)
    return await insertPosts(postsToInsert)
}

/** Insert posts to the database. */
export async function insertPosts(postsToInsert: PostToInsert[]) {
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
    return await db
        .update(posts)
        .set({ ...valuesToUpdate, pending: false })
        .where(eq(posts.id, post.id))
        .returning()
}