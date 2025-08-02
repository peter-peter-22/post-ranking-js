import { and, desc, eq } from "drizzle-orm";
import { db } from "../../../db";
import { Post, posts } from "../../../db/schema/posts";
import { User } from "../../../db/schema/users";
import { candidateColumns } from "../../common";
import { personalizePosts } from "../../hydratePosts";
import { replyCommonFilters } from "../getReplies";
import { redisClient } from "../../../redis/connect";

/** Get the replies of the publisher of the post.  */
export async function getPublisherComments({
    user,
    firstPage,
    post
}: {
    user: User,
    firstPage: boolean,
    post: Post
}) {
    if (!firstPage) return

    // Get ids from redis
    const ids=await redisClient.s

    // Fetch
    const myPosts = await personalizePosts(q, user)

    // Return
    return { posts: myPosts }
}