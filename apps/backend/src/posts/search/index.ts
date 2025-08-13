import { desc, lt } from "drizzle-orm"
import { posts } from "../../db/schema/posts"
import { User } from "../../db/schema/users"
import { postsPerRequest } from "../../redis/feeds/postFeeds/common"
import { getEnrichedPosts } from "../../redis/postContent/enrich"
import { SingleDatePageParams } from "../common"
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
    const fetchedPosts = await q;

    // Enrich
    const enrichedPosts = await getEnrichedPosts(fetchedPosts.map(p => p.id), user)

    // Get next page params
    const nextPageParams: SingleDatePageParams | undefined = enrichedPosts.length === postsPerRequest ? {
        maxDate: enrichedPosts[enrichedPosts.length - 1].createdAt.toISOString()
    } : undefined

    // Return the ranked posts and the page params
    return { data: enrichedPosts, pageParams: nextPageParams }
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
    const fetchedPosts = await q

    // Enrich
    const enrichedPosts = await getEnrichedPosts(fetchedPosts.map(p => p.id), user)

    // Get next page params
    const nextPageParams: TopPostsPageParam | undefined = enrichedPosts.length === postsPerRequest ? {
        maxEngagements: enrichedPosts[enrichedPosts.length - 1].likes
    } : undefined

    // Return the ranked posts and the page params
    return { data: enrichedPosts, pageParams: nextPageParams }
}