import { and, desc, eq, lt, lte } from "drizzle-orm";
import { db } from "../..";
import { trends } from "../../schema/trends";
import { userClusterTrends } from "../../schema/userClusterTrends";
import { User } from "../../schema/users";
import { getClusterTrendColumns, getTrendColumns } from "./getTrends";
import { HttpError } from "../../../middlewares/errorHandler";
import { trendsPerPage } from "../../../redis/trendFeeds/common";

export type TrendPostScorePageParams = { maxScore: number, lastKeyword: string }

export async function globalTrendFeed({ offset, pageParams }: { offset?: number, pageParams?: TrendPostScorePageParams }) {
    if (offset !== 0 && !pageParams) return

    const fetchedTrends = await db
        .select({
            ...getTrendColumns(),
            score: trends.score
        })
        .from(trends)
        .where(
            pageParams && and(
                lte(trends.score, pageParams.maxScore),
                lt(trends.keyword, pageParams.lastKeyword)
            )
        )
        .orderBy(desc(trends.score))
        .limit(trendsPerPage)

    if (fetchedTrends.length === 0) return

    const lastTrend = fetchedTrends[fetchedTrends.length - 1]
    const nextPageParams: TrendPostScorePageParams = {
        maxScore: lastTrend.score,
        lastKeyword: lastTrend.keyword
    }

    return { data: fetchedTrends, pageParams: nextPageParams }
}

export type TrendPostCountPageParams = { maxCount: number, lastKeyword: string }

export async function personalTrendFeed({ offset, user, pageParams }: { offset?: number, pageParams?: TrendPostCountPageParams, user: User }) {
    if (offset !== 0 && !pageParams) return
    if (!user.clusterId) throw new HttpError(400, "The user is not in a cluster")

    const fetchedTrends = await db
        .select(getClusterTrendColumns())
        .from(userClusterTrends)
        .where(
            and(
                eq(userClusterTrends.clusterId, user.clusterId),
                pageParams && and(
                    lte(trends.postCount, pageParams.maxCount),
                    lt(trends.keyword, pageParams.lastKeyword)
                )
            )
        )
        .orderBy(desc(userClusterTrends.count))
        .limit(trendsPerPage)

    if (fetchedTrends.length === 0) return

    const lastTrend = fetchedTrends[fetchedTrends.length - 1]
    const nextPageParams: TrendPostCountPageParams = {
        maxCount: lastTrend.postCount,
        lastKeyword: lastTrend.keyword
    }

    return { data: fetchedTrends, pageParams: nextPageParams }
}