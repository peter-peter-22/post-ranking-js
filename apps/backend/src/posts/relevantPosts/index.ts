import { Post } from "../../db/schema/posts";
import { User } from "../../db/schema/users";
import { HttpError } from "../../middlewares/errorHandler";
import { cachedPosts } from "../../redis/postContent";
import { enrichPostArray } from "../../redis/postContent/enrich";
import { deduplicatePosts, SingleDatePageParams } from "../common";
import { ESimPageParams } from "../forYou/candidates/embedding";
import { getKeywordCandidates } from "../forYou/candidates/keywords";
import { rankPosts } from "../ranker";
import { getPostEmbeddingSimilarityCandidates } from "./candidates/embedding";

export type RelevantPostsPageParams = {
    trends?: SingleDatePageParams,
    embedding?: ESimPageParams,
}

/** Get posts from the main feed of a user. */
export async function getRelevantPosts({ user, pageParams, offset, postId }: { user: User, pageParams?: RelevantPostsPageParams, offset: number, postId: string }) {
    // Select the main post
    const post = await cachedPosts.readSingle(postId)
    if (!post)
        throw new HttpError(404, "Post not found")
    // Common data
    const firstPage = !offset
    // Get the candidate posts
    const results = await Promise.all([
        getKeywordCandidates({ keywords: post.keywords ?? [], user, count: 30, pageParams: pageParams?.trends, firstPage }),
        getPostEmbeddingSimilarityCandidates({ user, count: 30, pageParams: pageParams?.embedding, firstPage, skipped: offset, maxDistance: 1, vectorNormalized: post.embeddingNormalized }),
    ])
    const [trendPosts, embeddingPosts] = results
    // Merge the posts
    const allPosts: Post[] = deduplicatePosts(results.map(e => e?.posts || []).flat())
    if (allPosts.length === 0) return
    // Enrich
    const enrichedPosts = await enrichPostArray(allPosts, user)
    // Merge page params
    const allPageParams: RelevantPostsPageParams = {
        trends: trendPosts?.pageParams,
        embedding: embeddingPosts?.pageParams,
    }
    // Rank
    const rankedPosts = await rankPosts(enrichedPosts)
    // Return the ranked posts and the page params
    return { posts: rankedPosts, pageParams: allPageParams }
}