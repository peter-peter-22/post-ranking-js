import { and, asc, getTableColumns, gt, inArray, l2Distance, lt } from "drizzle-orm";
import { db } from "../../../db";
import { Vector } from "../../../db/controllers/embedding/updateUserEmbedding";
import { getTimeBuckets } from "../../../db/controllers/posts/timeBuckets";
import { posts } from "../../../db/schema/posts";
import { User } from "../../../db/schema/users";
import { candidateColumns } from "../../common";
import { maxAge, minimalEngagement } from "../../filters";
import { ESimPageParams } from "../../forYou/candidates/embedding";
import { personalizePosts } from "../../hydratePosts";

/** Selecting candidate posts those embedding is similar to a provided vector, with a minimum threshold. */
export async function getPostEmbeddingSimilarityCandidates({
    skipped,
    count,
    pageParams,
    firstPage,
    user,
    vectorNormalized,
    maxDistance
}: {
    skipped: number,
    firstPage: boolean,
    pageParams?: ESimPageParams,
    count: number,
    user: User,
    vectorNormalized: Vector | null,
    maxDistance: number
}) {
    if (!firstPage && !pageParams || !vectorNormalized) return

    // Get the searched time buckets
    const timeBuckets = getTimeBuckets(maxAge(), new Date(), false, true)
    console.log(`Selecting embedding similarity candidates from the following time buckets: ${timeBuckets.join(', ')}`)

    // Select the recent relevant posts.
    const relevantPostsUnfiltered = db.$with("posts").as(
        db
            .select({
                ...getTableColumns(posts),
                distance: l2Distance(posts.embeddingNormalized, vectorNormalized).as("l2Distance")
            })
            .from(posts)
            .where(
                inArray(posts.timeBucket, timeBuckets)
            )
            .orderBy(asc(l2Distance(posts.embeddingNormalized, vectorNormalized)))
            .limit(count + skipped) // Any additional filter breaks the index, so the number of the selected rows in increased here, then filtered later
    )

    // Filter the selected posts.
    const q = db
        .with(relevantPostsUnfiltered)
        .select(candidateColumns("EmbeddingSimilarity"))
        .from(relevantPostsUnfiltered)
        .where(
            and(
                pageParams && gt(relevantPostsUnfiltered.distance, pageParams.minDistance),
                lt(relevantPostsUnfiltered.distance, maxDistance),
                minimalEngagement(),
                // Filtering out the pending posts and the replies is not necessary, because these have no embedding vector
            )
        )
        .$dynamic()

    // Fetch
    const myPosts = await personalizePosts(q, user)
    console.log(myPosts.map(p => p.similarity))

    // Get next page params
    const nextPageParams: ESimPageParams | undefined = myPosts.length === count ? {
        minDistance: 1 - myPosts[myPosts.length - 1].similarity
    } : undefined

    // Return
    return { posts: myPosts, pageParams: nextPageParams }
}