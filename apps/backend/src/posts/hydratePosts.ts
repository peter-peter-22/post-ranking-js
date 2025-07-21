import { aliasedTable, and, cosineDistance, eq, exists, sql } from "drizzle-orm"
import { db } from "../db"
import { personalUserColumns } from "../db/controllers/users/getUser"
import { EngagementHistory, engagementHistory } from "../db/schema/engagementHistory"
import { follows } from "../db/schema/follows"
import { likes } from "../db/schema/likes"
import { posts } from "../db/schema/posts"
import { User, users } from "../db/schema/users"
import { CandidateSubquery, exampleCandiadteQuery } from "./common"

export const postsToHydrateQuery=exampleCandiadteQuery.as("post_ids_to_hydrate")

/** Add personal data and other things to the posts. */
export function personalizePosts(source:CandidateSubquery, user: User | undefined) {
    // With query to get the posts
    const postsToHydrate = source.as("post_ids_to_hydrate")

    // Replied by followed user
    const replies = aliasedTable(posts, "replies")
    const isRepliedByFollowedSq = (user ? (
        exists(db
            .select()
            .from(replies)
            .where(and(
                eq(replies.replyingTo, postsToHydrate.id),
            ))
            .innerJoin(follows, and(
                eq(follows.followedId, replies.userId),
                eq(follows.followerId, user.id)
            )))
    ) : (
        sql<boolean>`false::boolean`
    )).as<boolean>("replied_by_followed")

    // Liked by viewer
    const likedByViewerSq = (user ? (
        exists(db
            .select()
            .from(likes)
            .where(and(
                eq(likes.postId, postsToHydrate.id),
                eq(likes.userId, user.id)
            ))
        )
    ) : (
        sql<boolean>`false::boolean`
    )).as<boolean>("liked_by_viewer")

    // Embedding similarty between the viewer and the post
    const similarity = (user?.embedding ? (
        sql<number>`1 - (${cosineDistance(postsToHydrate.embedding, user.embedding)})`
    ) : (
        sql<number>`0::real`
    )).as("embedding_similarity")

    // The main query
    const query = db
        .select({
            id: postsToHydrate.id,
            userId:postsToHydrate.userId,
            text: postsToHydrate.text,
            createdAt: postsToHydrate.createdAt,
            likes: postsToHydrate.likeCount,
            replies: postsToHydrate.replyCount,
            clicks: postsToHydrate.clickCount,
            views: postsToHydrate.viewCount,
            engagementCount:postsToHydrate.engagementCount,
            similarity: similarity,
            engagementHistory: user ? engagementHistory : sql<EngagementHistory>`null`,
            repliedByFollowed: isRepliedByFollowedSq,
            liked: likedByViewerSq,
            user: personalUserColumns(user?.id),
            media: postsToHydrate.media,
            commentScore: postsToHydrate.commentScore,
            replyingTo:postsToHydrate.replyingTo,
            deleted:postsToHydrate.deleted,
            //debug
            keywords: postsToHydrate.keywords,
            mentions:postsToHydrate.mentions,
            hashtags:postsToHydrate.hashtags,
            embeddingText: postsToHydrate.embeddingText,
            source:postsToHydrate.source
        })
        .from(postsToHydrate)
        .innerJoin(users, eq(users.id, postsToHydrate.userId))
        .$dynamic()

    // Engagement history between the viewer and the poster
    if (user)
        query.leftJoin(engagementHistory, and(
            eq(engagementHistory.viewerId, user.id),
            eq(engagementHistory.publisherId, postsToHydrate.userId)
        ))

    return query
}

export type PersonalPost = Awaited<ReturnType<typeof personalizePosts>>[number] & {
    score?: number
};