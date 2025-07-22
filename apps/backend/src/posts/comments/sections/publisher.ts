import { and, desc, eq } from "drizzle-orm";
import { db } from "../../../db";
import { Post, posts } from "../../../db/schema/posts";
import { ClientUser } from "@me/schemas/src/zod/user";
import { candidateColumns } from "../../common";
import { personalizePosts } from "../../hydratePosts";
import { replyCommonFilters } from "../getReplies";

/** Get the replies of the publisher of the post.  */
export async function getPublisherComments({
    user,
    firstPage,
    post
}: {
    user: ClientUser,
    firstPage: boolean,
    post: Post
}) {
    if (!firstPage) return

    // Query
    const q = db
        .select(candidateColumns("Publisher"))
        .from(posts)
        .where(and(
            ...replyCommonFilters(post.id),
            eq(posts.userId, post.userId)
        ))
        .orderBy(desc(posts.createdAt))
        .$dynamic()

    // Fetch
    const myPosts = await personalizePosts(q, user)

    // Return
    return { posts: myPosts }
}