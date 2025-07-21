import { and, eq, gte, sql, sum } from "drizzle-orm"
import { db } from "../.."
import { keywordPopularity } from "../../schema/keywordPopularity"
import { trends } from "../../schema/trends"
import { insertSelect } from "../../utils/insertSelect"
import { countKeywords, updateAllKeywordPopularities } from "./updateTrendTracker"

/** The time interval that decides the average popularity of a keyword. */
const referenceInterval = 1000 * 60 * 60 * 24 * 10 //10 days
/** The time interval where the current popularity of th posts are measured. */
const currentInterval = 1000 * 60 * 60 * 24 //1 day

export async function updateTrends() {
    console.log("Updating trends...")

    // Update the keyword popularities before the trends.
    await updateAllKeywordPopularities()

    // Define the start of both intervals.
    const referenceStart = new Date(Date.now() - referenceInterval)
    const currentStart = new Date(Date.now() - currentInterval)

    /** Subquery to get post counts in the reference interval. */
    const currentCount = countKeywords(currentStart, new Date()).as("current_count")

    /** Sub query to get the post count of both the current and the reference interval. */
    const relativeCounts = db
        .select({
            keyword: currentCount.keyword,
            // Total posts in the reference interval.
            referenceCount: sql`
            coalesce(
                ${db
                    .select({ count: sum(keywordPopularity.posts) })
                    .from(keywordPopularity)
                    .where(and(
                        eq(keywordPopularity.keyword, currentCount.keyword),
                        gte(keywordPopularity.date, referenceStart)
                    ))
                },1)`.as("reference_count"),
            // Total posts in the current interval.
            currentCount: currentCount.posts,
        })
        .from(currentCount)
        .as("relative_counts")

    /** Subquery to get calculate the trend scores. */
    const trendScores = db
        .select({
            keyword: relativeCounts.keyword,
            growth: sql<number>`
                        (${relativeCounts.currentCount}*${referenceInterval / currentInterval})::float
                        /
                        ${relativeCounts.referenceCount}::float`.as("growth"),
            postCount: relativeCounts.currentCount,
        })
        .from(relativeCounts)

    // Delere the previous trends.
    await db.delete(trends)

    // Insert the new trends.
    await insertSelect(trends, trendScores)

    console.log("Updated trends.")
}