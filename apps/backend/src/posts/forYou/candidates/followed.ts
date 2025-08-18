import { and, desc, eq, exists, gt, inArray, lt, or } from "drizzle-orm";
import { db } from "../../../db";
import { posts } from "../../../db/schema/posts";
import { User, users } from "../../../db/schema/users";
import { candidateColumns, DatePageParams } from "../../common";
import { isPost, noPending, recencyFilter } from "../../filters";
import { personalizePosts } from "../../hydratePosts";
import { follows } from "../../../db/schema/follows";

/** Selecting candidate posts from the users those the viewer follows */
export async function getFollowedCandidates({
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
    if (!firstPage && !pageParams) return

    // Get the posts
    

    // Get next page params
    const nextPageParams: DatePageParams | undefined = myPosts.length === count ? {
        skipStart: myPosts[0].createdAt.toISOString(),
        skipEnd: myPosts[myPosts.length - 1].createdAt.toISOString()
    } : undefined
    // Return
    return { posts: myPosts, pageParams: nextPageParams }
}