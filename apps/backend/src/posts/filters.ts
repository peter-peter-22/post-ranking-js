import { isNotNull, isNull } from "drizzle-orm";
import { posts } from "../db/schema/posts";

/** Filter out replies. */
export const isPost = () => isNull(posts.replyingTo)

/** Filter out replies. */
export const isReply = () => isNotNull(posts.replyingTo)

/** Max age of the post on the main feed in ms */
export const mainFeedMaxAge = 1000 * 60 * 60 * 24 * 2  // 2 days

export const postFilter = "isReply:{0}"
export const mfDatePagination = (maxDate?: Date) => `@createdAt:[${Date.now() - mainFeedMaxAge} ${maxDate ? maxDate.getTime() : "+inf"}]`