import { getTrendNames } from "../../db/controllers/trends/getTrends";
import { User } from "../../db/schema/users";
import { DatePageParams, deduplicatePosts, mergePostArrays } from "../common";
import { rankPosts } from "../ranker";
import { ESimPageParams, getEmbeddingSimilarityCandidates } from "./candidates/embedding";
import { getFollowedCandidates } from "./candidates/followed";
import { getGraphClusterCandidates } from "./candidates/graphCluster";
import { getTrendCandidates } from "./candidates/trending";

export type ForYouPageParams = {
    followed?: DatePageParams,
    trends?: DatePageParams,
    embedding?: ESimPageParams,
    cluster?:DatePageParams
}

/** Get posts from the main feed of a user */
export async function getMainFeed({ user, pageParams, offset }: { user: User, pageParams?: ForYouPageParams, offset: number }) {
    // Get common data
    const firstPage = !offset
    const [trends] = await Promise.all([
        getTrendNames(user.clusterId),
    ])

    // Get the candidate posts
    const [followedPosts, trendPosts, embeddingPosts,clusterPosts] = await Promise.all([
        getFollowedCandidates({ count: 30, user, pageParams: pageParams?.followed, firstPage }),
        getTrendCandidates({ trends, user, count: 30, pageParams: pageParams?.trends, firstPage }),
        getEmbeddingSimilarityCandidates({ user, count: 30, pageParams: pageParams?.embedding, firstPage, skipped: offset }),
        getGraphClusterCandidates({  count: 30, user, pageParams: pageParams?.followed, firstPage })
    ])
    // Merge the posts
    let allPosts = mergePostArrays([followedPosts?.posts, trendPosts?.posts, embeddingPosts?.posts,clusterPosts?.posts])
    // Exit if no posts
    if (allPosts.length === 0) return
    // Deduplicate
    allPosts = deduplicatePosts(allPosts)
    // Merge page params
    const allPageParams: ForYouPageParams = {
        followed: followedPosts?.pageParams,
        trends: trendPosts?.pageParams,
        embedding: embeddingPosts?.pageParams,
        cluster:clusterPosts?.pageParams
    }
    // Rank
    allPosts = await rankPosts(allPosts)
    // Return the ranked posts and the page params
    return { posts: allPosts, pageParams: allPageParams }
}