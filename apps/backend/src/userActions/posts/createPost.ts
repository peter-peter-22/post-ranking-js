import { db } from "../../db";
import { addMedia } from "../../db/controllers/pendingUploads/updateMedia";
import { Post, posts, PostToInsert } from "../../db/schema/posts";
import { chunkedInsert } from "../../db/utils/chunkedInsert";
import { handlePostInsert } from "../../redis/postContent";
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
    const preparedPost = await prepareAnyPost(post)
    const [created] = await db
        .insert(posts)
        .values(preparedPost.post)
        .returning()
    await handlePostInsert({ post: created, replied: preparedPost.replied })
    if (post.media) await addMedia(post.media, post.userId)
    return created
}