import { and, asc, gt, inArray, l2Distance } from "drizzle-orm";
import { db } from "../../../db";
import { getTimeBuckets } from "../../../db/controllers/posts/timeBuckets";
import { posts } from "../../../db/schema/posts";
import { User } from "../../../db/schema/users";
import { candidateColumns } from "../../common";
import { maxAge, minimalEngagement } from "../../filters";
import { personalizePosts } from "../../hydratePosts";

export type ESimPageParams = {
    minDistance: number
}

/** Selecting candidate posts those embedding is similar to a provided vector.*/
export async function getEmbeddingSimilarityCandidates({
    skipped,
    count,
    pageParams,
    firstPage,
    user
}: {
    skipped: number,
    firstPage: boolean,
    pageParams?: ESimPageParams,
    count: number,
    user: User
}) {
    if (!firstPage && !pageParams || !user.embeddingNormalized) return

    // Get the searched time buckets
    const timeBuckets = getTimeBuckets(maxAge(), new Date(), false, true)
    console.log(`Selecting embedding similarity candidates from the following time buckets: ${timeBuckets.join(', ')}`)

    // Select the recent relevant posts.
    const relevantPostsUnfiltered = db.$with("posts").as(
        db
            .select()
            .from(posts)
            .where(
                inArray(posts.timeBucket, timeBuckets)
            )
            .orderBy(asc(l2Distance(posts.embeddingNormalized, user.embeddingNormalized)))
            .limit(count + skipped) // Any additional filter breaks the index, so the number of the selected rows in increased here, then filtered later
    )

    // Filter the selected posts.
    const q = db
        .with(relevantPostsUnfiltered)
        .select(candidateColumns("EmbeddingSimilarity"))
        .from(relevantPostsUnfiltered)
        .where(
            and(
                pageParams && gt(l2Distance(posts.embeddingNormalized, user.embeddingNormalized), pageParams.minDistance),//TODO: add the embedding distance to the candidate columns and use it here
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