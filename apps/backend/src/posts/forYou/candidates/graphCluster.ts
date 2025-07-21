import { and, desc, eq, gt, lt, or } from "drizzle-orm";
import { db } from "../../../db";
import { posts } from "../../../db/schema/posts";
import { User, users } from "../../../db/schema/users";
import { candidateColumns, DatePageParams } from "../../common";
import { isPost, minimalEngagement, noPending, recencyFilter } from "../../filters";
import { personalizePosts } from "../../hydratePosts";

/** Selecting candidate posts from the graph cluster of the user.
 * @todo The user is added to the posts again later.
*/
export async function getGraphClusterCandidates({
    user,
    count,
    pageParams,
    firstPage
}: {
    user: User,
    count: number,
    pageParams?: DatePageParams,
    firstPage: boolean
}) {
    if (!firstPage && !pageParams || !user.clusterId) return

    // Get the posts.
    const q = db
        .select(candidateColumns("GraphClusters"))
        .from(posts)
        .where(
            and(
                pageParams && or(
                    gt(posts.createdAt, new Date(pageParams.skipStart)),
                    lt(posts.createdAt, new Date(pageParams.skipEnd))
                ),
                isPost(),
                minimalEngagement(),
                recencyFilter(),
                noPending(),
                eq(users.clusterId, user.clusterId),
            )
        )
        .innerJoin(users, eq(users.id, posts.userId))
        .orderBy(desc(posts.createdAt))
        .limit(count)
        .$dynamic()
    const myPosts = await personalizePosts(q, user)

    // Get next page params
    const nextPageParams: DatePageParams | undefined = myPosts.length === count ? {
        skipStart: myPosts[0].createdAt.toISOString(),
        skipEnd: myPosts[myPosts.length - 1].createdAt.toISOString()
    } : undefined
    // Return
    return { posts: myPosts, pageParams: nextPageParams }
}