import { User } from "../../db/schema/users";
import { DatePageParams } from "../common";
import { getFollowedCandidates } from "../forYou/candidates/followed";
import { rankPosts } from "../ranker";

export type FollowedPostsPageParams = {
    followed?: DatePageParams,
}

/** Get posts from the main feed of a user */
export async function getFollowedFeed({ user, pageParams, offset }: { user: User, pageParams?: FollowedPostsPageParams, offset: number }) {
    // Get common data
    const firstPage = !offset

    // Get the candidate posts
    const [followedPosts] = await Promise.all([
        getFollowedCandidates({ count: 1000, user, pageParams: pageParams?.followed, firstPage }),
    ])
    // Merge the posts
    let allPosts = followedPosts?.posts||[]
    // Exit if no posts
    if (allPosts.length === 0) return
    // Merge page params
    const allPageParams: FollowedPostsPageParams = {
        followed: followedPosts?.pageParams,
    }
    // Rank
    allPosts = await rankPosts(allPosts)
    // Return the ranked posts and the page params
    return { posts: allPosts, pageParams: allPageParams }
}