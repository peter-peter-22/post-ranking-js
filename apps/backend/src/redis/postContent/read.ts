import { inArray } from "drizzle-orm";
import { db } from "../../db";
import { Post, posts } from "../../db/schema/posts";
import { cachedBulkHSetRead } from "../bulkHSetRead";
import { getMainFeedTTL, postContentTTL } from "../common";

export function postContentRedisKey(id: string) {
    return `post:${id}:content`;
}

export const cachedPosts = cachedBulkHSetRead<Post>({
    schema: {
        id: "string",
        userId: "string",
        text: "string",
        createdAt: "date",
        likeCount: "number",
        replyCount: "number",
        viewCount: "number",
        clickCount: "number",
        topic: "string",
        engaging: "number",
        replyingTo: "string",
        engagementCount: "number",
        embeddingText: "string",
        embedding: "json",
        embeddingNormalized: "json",
        hashtags: "json",
        keywords: "json",
        mentions: "json",
        pending: "boolean",
        media: "json",
        commentScore: "number",
        timeBucket: "number",
        isReply: "boolean",
        deleted: "boolean",
        repliedUser: "string",
    },
    getTTL: (post: Post) => {
        return getMainFeedTTL(post.createdAt, postContentTTL)
    },
    getKey: postContentRedisKey,
    fallback: async (ids: string[]) => await db.select().from(posts).where(inArray(posts.id, ids)),
    getId: (post: Post) => post.id
})