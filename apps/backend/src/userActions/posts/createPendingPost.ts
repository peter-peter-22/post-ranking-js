import { db } from "../../db";
import { posts } from "../../db/schema/posts";

/** Create a pending post in the database and return it's id. */
export async function createPendingPost(userId: string) {
    const created = await db.insert(posts).values({
        userId,
        text: "",
        pending:true
    }).returning({id:posts.id})
    return created[0].id
}