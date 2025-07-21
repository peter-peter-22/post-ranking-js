import { eq } from "drizzle-orm";
import { db } from "../../db";
import { posts } from "../../db/schema/posts";
import { User } from "../../db/schema/users";
import { HttpError } from "../../middlewares/errorHandler";
import { DatePageParams, deduplicatePosts, mergePostArrays } from "../common";
import { ESimPageParams } from "../forYou/candidates/embedding";
import { getTrendCandidates } from "../forYou/candidates/trending";
import { rankPosts } from "../ranker";
import { getPostEmbeddingSimilarityCandidates } from "./candidates/embedding";
import { postProcessPosts } from "../postProcessPosts";

export type RelevantPostsPageParams = {
    trends?: DatePageParams,
    embedding?: ESimPageParams,
}

/** Get posts from the main feed of a user. */
export async function getRelevantPosts({ user, pageParams, offset, postId }: { user: User, pageParams?: RelevantPostsPageParams, offset: number, postId: string }) {
    // Select the main post
    const [post] = await db.select().from(posts).where(eq(posts.id, postId))
    if (!post)
        throw new HttpError(404, "Post not found")
    // Common data
    const firstPage = !offset
    // Get the candidate posts
    const [trendPosts, embeddingPosts] = await Promise.all([
        getTrendCandidates({ trends: post.keywords ?? [], user, count: 30, pageParams: pageParams?.trends, firstPage }),
        getPostEmbeddingSimilarityCandidates({ user, count: 30, pageParams: pageParams?.embedding, firstPage, skipped: offset, maxDistance: 1, vectorNormalized: post.embeddingNormalized }),
    ])
    // Merge the posts
    let allPosts = mergePostArrays([trendPosts?.posts, embeddingPosts?.posts])
    // Exit if no posts
    if (allPosts.length === 0) return
    // Deduplicate
    allPosts = deduplicatePosts(allPosts)
    // Merge page params
    const allPageParams: RelevantPostsPageParams = {
        trends: trendPosts?.pageParams,
        embedding: embeddingPosts?.pageParams,
    }
    // Rank
    allPosts = await rankPosts(allPosts)
    // Return the ranked posts and the page params
    return { posts: await postProcessPosts(allPosts), pageParams: allPageParams }
}