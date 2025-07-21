import { and, desc, eq, not } from "drizzle-orm";
import { db } from "../../../db";
import { follows } from "../../../db/schema/follows";
import { Post, posts } from "../../../db/schema/posts";
import { User } from "../../../db/schema/users";
import { candidateColumns } from "../../common";
import { personalizePosts } from "../../hydratePosts";
import { replyCommonFilters } from "../getReplies";

/** Get the replies of the followed users.  */
export async function getFollowedComments({
    user,
    firstPage,
    post
}: {
    user: User,
    firstPage: boolean,
    post: Post
}) {
    if (!firstPage) return

    // Query
    const q= db
        .select(candidateColumns("Followed"))
        .from(posts)
        .where(and(
            ...replyCommonFilters(post.id),
            // Skip the comments of the poster
            not(eq(posts.userId, post.userId))
        ))
        .innerJoin(follows, and(
            eq(follows.followerId, user.id),
            eq(follows.followedId, posts.userId),
        ))
        .orderBy(desc(posts.commentScore), desc(posts.createdAt))
        .$dynamic()

    // Fetch
    const myPosts = await personalizePosts(q, user)

    // Return
    return { posts: myPosts }
}