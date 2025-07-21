import { desc, lt } from "drizzle-orm"
import { posts } from "../../db/schema/posts"
import { User } from "../../db/schema/users"
import { postsPerRequest } from "../../redis/postFeeds/common"
import { SingleDatePageParams } from "../common"
import { personalizePosts } from "../hydratePosts"
import { postSearchQuery } from "./postSearchQuery"

export async function searchLatestPosts({
    user,
    pageParams,
    offset,
    filterUserHandle,
    text
}: {
    user: User,
    pageParams?: SingleDatePageParams,
    offset: number,
    filterUserHandle?: string,
    text?: string
}) {
    if (offset !== 0 && !pageParams) return

    // Query
    const q = postSearchQuery({
        text,
        filterUserHandle,
        filter: pageParams && lt(posts.createdAt, new Date(pageParams.maxDate))
    })
        .orderBy(desc(posts.createdAt))

    // Fetch
    const myPosts = await personalizePosts(q, user)

    // Get next page params
    const nextPageParams: SingleDatePageParams | undefined = myPosts.length === postsPerRequest ? {
        maxDate: myPosts[myPosts.length - 1].createdAt.toISOString()
    } : undefined

    // Return the ranked posts and the page params
    return { data: myPosts, pageParams: nextPageParams }
}

export type TopPostsPageParam = {
    maxEngagements: number
}

export async function searchTopPosts({
    user,
    pageParams,
    offset,
    filterUserHandle,
    text
}: {
    user: User,
    pageParams?: TopPostsPageParam,
    offset: number,
    filterUserHandle?: string,
    text?: string
}) {
    if (offset !== 0 && !pageParams) return

    // Query
    const q = postSearchQuery({
        text,
        filterUserHandle,
        filter: pageParams && lt(posts.createdAt, new Date(pageParams.maxEngagements))
    })
        .orderBy(desc(posts.engagementCount))

    // Fetch
    const myPosts = await personalizePosts(q, user)

    // Get next page params
    const nextPageParams: TopPostsPageParam | undefined = myPosts.length === postsPerRequest ? {
        maxEngagements: myPosts[myPosts.length - 1].engagementCount
    } : undefined

    // Return the ranked posts and the page params
    return { data: myPosts, pageParams: nextPageParams }
}