import { and, eq, gte, inArray, sum } from "drizzle-orm";
import { db } from "../..";
import { engagementHistory } from "../../schema/engagementHistory";

/** The days of engagement histories to aggregate. */
const engagementHistoryRange = 30

/** The the current time in days. */
export function getDays() {
    return Math.floor(Date.now() / (1000 * 60 * 60 * 24))
}

/** Load the total engagement history form the last 30 days. */
export async function loadAggregatedEngagementHistory(viewerIds: string[]) {
    const minTimeBucket = getDays() - engagementHistoryRange

    // Get the aggregated engagement histories from the db
    const aggregatedEngagements = await db
        .select({
            viewerId: engagementHistory.viewerId,
            publisherId: engagementHistory.publisherId,
            likes: sum(engagementHistory.likes).as<number>("likes"),
            replies: sum(engagementHistory.replies).as<number>("replies"),
            clicks: sum(engagementHistory.clicks).as<number>("clicks"),
        })
        .from(engagementHistory)
        .where(and(
            inArray(engagementHistory.viewerId, viewerIds),
            gte(engagementHistory.timeBucket, minTimeBucket)
        ))
        .groupBy(engagementHistory.viewerId, engagementHistory.publisherId)

    return aggregatedEngagements
}

/** Load the engagement history from the active time bucket. */
export async function loadCurrentEngagementHistory(viewerIds: string[]) {
    const timeBucket=getDays()

    // Get the aggregated engagement histories from the db
    const aggregatedEngagements = await db
        .select()
        .from(engagementHistory)
        .where(and(
            inArray(engagementHistory.viewerId, viewerIds),
            eq(engagementHistory.timeBucket, timeBucket)
        ))

    return aggregatedEngagements
}