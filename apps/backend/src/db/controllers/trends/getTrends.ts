import { desc, eq, notInArray, sql } from "drizzle-orm"
import { db } from "../.."
import { getOrGenerateCache } from "../../../redis/cachedRead"
import { trends } from "../../schema/trends"
import { userClusterTrends } from "../../schema/userClusterTrends"

export function getTrendColumns() {
    return {
        keyword: trends.keyword,
        postCount: trends.postCount,
        category: sql<string>`'global'::text`.as("trend_category")
    }
}

export function getClusterTrendColumns() {
    return {
        keyword: userClusterTrends.keyword,
        postCount: userClusterTrends.count,
        category: sql<string>`'personal'::text`.as("trend_category")
    }
}

export type TrendForClient = {
    keyword: string,
    postCount: number,
    category: string
}

/** Return the the top and personalized trends. */
async function fetchTrends(clusterId: number | null) {
    if (clusterId) {
        // If the clusterid is defined, fetch the personalized and global trends.

        /** Top personalized trends */
        const personalTrends = await db
            .select(getClusterTrendColumns())
            .from(userClusterTrends)
            .innerJoin(trends, eq(userClusterTrends.keyword, trends.keyword))
            .where(eq(userClusterTrends.clusterId, clusterId))
            .orderBy(desc(userClusterTrends.count))
            .limit(5)

        /** The keywords of the personalized trends. */
        const personalKeywords = personalTrends.map(t => t.keyword)

        /** Top global trends */
        const globalTrends = await db
            .select(getTrendColumns())
            .from(trends)
            .where(notInArray(trends.keyword, personalKeywords))
            .orderBy(trends.score)
            .limit(5)

        return [...personalTrends, ...globalTrends]
    }
    else {
        // If the cluster id is undefined, fetch only the global trends.

        return await db
            .select(getTrendColumns())
            .from(trends)
            .orderBy(trends.score)
            .limit(10)
    }
}

/** Expiration time of cache. */
const expiration = 60 * 5 // 5 minutes

/** Get the the top trends. */
export async function getTrends(clusterId: number | null) {
    return await getOrGenerateCache<TrendForClient[]>(`trends/cluster/${clusterId}`, async () => await fetchTrends(clusterId), expiration)
}

/** Get the names of the top trends. */
export async function getTrendNames(clusterId: number | null) {
    return (await getTrends(clusterId)).map(trend => trend.keyword)
}
