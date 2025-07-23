import { eq, gt, gte, isNotNull, isNull, lte, notInArray, or } from "drizzle-orm";
import { posts } from "../db/schema/posts";

/** Filter out pending posts. */
export const noPending = () => {
    return eq(posts.pending, false)
}

/** Filter out replies. */
export const isPost = () => isNull(posts.replyingTo)

/** Filter out replies. */
export const isReply = () => isNotNull(posts.replyingTo)

/** Filter out the posts those have a significant amount of views, but no engagement. */
export const minimalEngagement = () => or(gte(posts.engagementCount, 5), lte(posts.viewCount, 50));

export const mainFeedMaxAge = 1000 * 60 * 60 * 24 * 2  // 2 days

/** Get the date of the max age of the posts. */
export const maxDate = () => {
    return new Date(Date.now() - mainFeedMaxAge)
}

/** Filter out the posts those are older than 2 days */
export const recencyFilter = () => {
    const maxAgeDate = maxDate()
    return gt(posts.createdAt, maxAgeDate)
}

/** Skip the posts those are already displayed */
export const notDisplayed = (skipIds: string[] = []) => notInArray(posts.id, skipIds)

/** Get the replies of a post. */
export const replyOfPost = (postId: string) => {
    return eq(posts.replyingTo, postId)
}