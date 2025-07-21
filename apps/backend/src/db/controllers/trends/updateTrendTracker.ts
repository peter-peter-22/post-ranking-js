import { and, asc, count, desc, gte, lt, sql } from "drizzle-orm";
import { db } from "../..";
import { isPost } from "../../../posts/filters";
import { formatDate } from "../../../utilities/date/formatDates";
import { keywordPopularity } from "../../schema/keywordPopularity";
import { posts } from "../../schema/posts";

/** The length of the intervals where the keyword popularities are measured. */
const interval = 1000 * 60 * 60 * 24; // 1 day

/** Count the mentions of all keywords in a given time interval and record them in the database.
 * @param startDate - The start date of the time interval.
 * @param endDate - The end date of the time interval.
 */
async function updateKeywordPopularitiesInInterval(startDate: Date, endDate: Date) {
    console.log(`Counting keyword popularity between ${formatDate(startDate)} and ${formatDate(endDate)}.`)

    // With query to get the keyword counts
    const keywordCounts = db.$with("keyword_counts").as(countKeywords(startDate, endDate))

    // Count the keywords and insert the keyword popularity entries.
    await db
        .with(keywordCounts)
        .insert(keywordPopularity)
        .select(
            db
                .select({
                    keyword: keywordCounts.keyword,
                    posts: keywordCounts.posts,
                    date: sql<Date>`${endDate}`.as("date")
                })
                .from(keywordCounts)
        )

    console.log("Updated keyword popularity.")
}

/** Create a query to count how much posts belong to the keywords within the specified interval.
 * Skip the keywords those are below the minimum popularity.
 * @param startDate - The start date of the time interval.
 * @param endDate - The end date of the time interval.
 * @returns The query.
 */
export function countKeywords(startDate: Date, endDate: Date) {
    /** Minimum count of posts for a keyword to be tracked. */
    const minPosts = 5

    // With query to get the keywords
    const keywords = db.$with("keywords").as(getKeywords(startDate, endDate))

    // Subquery to count the keywords.
    const keywordCounts = db
        .with(keywords)
        .select({
            keyword: keywords.keyword,
            posts: count().as("posts_of_keyword"),
        })
        .from(keywords)
        .groupBy(keywords.keyword)

    // Count the keywords and insert the keyword popularity entries.
    return db
        .select()
        .from(keywordCounts.as("keyword_counts"))
        .where(t => gte(t.posts, minPosts))
        .$dynamic()
}

/** Query to get all keywords from a time interval as individual rows. */
function getKeywords(startDate: Date, endDate: Date) {
    return db
        .select({
            keyword: sql`unnest(keywords)`.as("a_keyword")
        })
        .from(posts)
        .where(
            and(
                gte(posts.createdAt, startDate),
                lt(posts.createdAt, endDate),
                isPost()
            )
        )
}

/** Check if enough time passed since the last update for another update cycle. */
function needUpdate(lastUpdate: Date) {
    return Date.now() - lastUpdate.getTime() >= interval
}

/** Update the keyword popularity tracker. */
export async function updateAllKeywordPopularities() {
    console.log("Updating all keyword popularity.")

    // Get the date of the last update todo.
    // TODO: Using persistent dates would have the same result, but maybe it's cleaner.
    let lastUpdate = (
        await db
            .select({ date: keywordPopularity.date })
            .from(keywordPopularity)
            .orderBy(desc(keywordPopularity.date))
            .limit(1)
    )[0]?.date

    // If there is no last update, use the date of the first post
    if (!lastUpdate) {
        console.log("No last update found, using the date of the first post.")
        lastUpdate = (
            await db
                .select({ date: posts.createdAt })
                .from(posts)
                .orderBy(asc(posts.createdAt))
                .limit(1)
        )[0]?.date
        // If no posts exist yet, exit
        if (!lastUpdate) {
            console.log("No posts exist yet. Exiting.")
            return
        }
    }

    // Create popularity records until needed
    while (needUpdate(lastUpdate)) {
        // Calculate the end of this interval
        const endOfInterval = new Date(lastUpdate.getTime() + interval)
        // Update the keywords in this interval
        await updateKeywordPopularitiesInInterval(lastUpdate, endOfInterval)
        // Update the last update date
        lastUpdate = endOfInterval
    }

    console.log("Finished updating all keyword popularity.")
}
