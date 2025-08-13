import { User } from "../../../db/schema/users";
import { redisClient } from "../../../redis/connect";
import { postHsetSchema } from "../../../redis/postContent";
import { enrichPostArray } from "../../../redis/postContent/enrich";
import { DatePageParams, SingleDatePageParams } from "../../common";
import { mfDatePagination } from "../../filters";

/** Selecting candidate posts from trending topics.
 * @todo Can be accelerated by using timebuckets.
 */
export async function getKeywordCandidates({
    keywords,
    pageParams,
    user,
    count,
    firstPage
}: {
    keywords: string[],
    user: User,
    count: number,
    pageParams?: SingleDatePageParams,
    firstPage: boolean
}) {
    if (!firstPage && !pageParams || keywords.length === 0) return
    console.log(`Getting post candidates for the following trends: ${keywords.join(", ")}`)

    // Get the posts
    const textFilter = `@text:(${keywords.map(k => "'" + k + "'").join("|")})`
    const dateRange = mfDatePagination(pageParams && new Date(pageParams.maxDate))
    const results = await redisClient.ft.search(
        "posts",
        [dateRange, textFilter].filter(Boolean).join(" "),
        {
            SORTBY: { BY: 'createdAt', DIRECTION: "DESC" },
            LIMIT: { from: 0, size: count }
        }
    )
    const fetchedPosts = postHsetSchema.parseSearch(results)

    // Enrich
    const enrichedPosts = await enrichPostArray(fetchedPosts, user)

    // Get next page params
    const nextPageParams: SingleDatePageParams | undefined = enrichedPosts.length === count ? {
        maxDate: enrichedPosts[0].createdAt.toISOString(),
    } : undefined
    // Return
    return { posts: enrichedPosts, pageParams: nextPageParams }
}