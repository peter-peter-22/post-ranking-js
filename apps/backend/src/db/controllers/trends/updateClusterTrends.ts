import { and, count, eq, gte, sql } from "drizzle-orm";
import { db } from "../..";
import { posts } from "../../schema/posts";
import { userClusterTrends } from "../../schema/userClusterTrends";
import { users } from "../../schema/users";
import { isPost, recencyFilter } from "../../../posts/filters";

export async function updateClusterTrends() {
    /** The minimum posts of a keyword in a cluster to be counter as trend. */
    const minPostCount = 5;

    // Each time any keyword mentioned as individual rows. 
    const clusterKeywords = db
        .select({
            clusterId: users.clusterId,
            keyword: sql<string>`unnest(${posts.keywords})`.as("cluster_keyword"),
        })
        .from(posts)
        .leftJoin(users, eq(users.id, posts.userId))
        .where(and(
            isPost(),
            recencyFilter()
        ))
        .as("cluster_keywords")

    // The count of keyword usage per cluster. 
    // TODO: save only the top 100 trends per cluster to save space?
    const clusterKeywordCounts = db
        .select({
            keyword: clusterKeywords.keyword,
            clusterId: clusterKeywords.clusterId,
            count: count().as("keyword_count_in_cluster")
        })
        .from(clusterKeywords)
        .groupBy(clusterKeywords.clusterId, clusterKeywords.keyword)
        .as("cluster_keyword_mentions")

    // Insert the cluster trends with minimal significance. 
    await db
        .insert(userClusterTrends)
        .select(db
            .select({
                keyword: clusterKeywordCounts.keyword,
                clusterId: clusterKeywordCounts.clusterId,
                count: clusterKeywordCounts.count
            })
            .from(clusterKeywordCounts)
            .where(gte(clusterKeywordCounts.count, minPostCount))
        )
}