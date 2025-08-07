import { eq, gte, isNotNull, isNull, lte, or } from "drizzle-orm";
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