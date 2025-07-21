import { and, desc, lt } from "drizzle-orm";
import { db } from "../../../db";
import { Post, posts } from "../../../db/schema/posts";
import { User } from "../../../db/schema/users";
import { candidateColumns, SingleDatePageParams } from "../../common";
import { personalizePosts } from "../../hydratePosts";
import { replyCommonFilters } from "../getReplies";
import { postsPerRequest } from "../../../redis/postFeeds/common";

/** Get the rest of the replies.  */
export async function getOtherComments({
    user,
    firstPage,
    post,
    pageParams,
}: {
    user: User,
    firstPage: boolean,
    post: Post,
    pageParams?: SingleDatePageParams,
}) {
    if (!firstPage && !pageParams) return

    // Query
    const q = db
        .select(candidateColumns("Rest"))
        .from(posts)
        .where(and(
            ...replyCommonFilters(post.id),
            // Skip the already seen replies
            pageParams && lt(posts.createdAt, new Date(pageParams.maxDate))
        ))
        .limit(postsPerRequest)
        .orderBy(desc(posts.commentScore), desc(posts.createdAt))
        .$dynamic()

    // Fetch
    const myPosts = await personalizePosts(q, user)

    // Get next page params
    const nextPageParams: SingleDatePageParams | undefined = myPosts.length === postsPerRequest ? {
        maxDate: myPosts[myPosts.length - 1].createdAt.toISOString()
    } : undefined
    
    // Return
    return { posts: myPosts, pageParams: nextPageParams }
}