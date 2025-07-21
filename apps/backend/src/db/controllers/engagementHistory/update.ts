import { and, count, eq, gt, isNotNull, sql, SQL, sum } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";
import { db } from "../..";
import { clicks } from "../../schema/clicks";
import { engagementHistory } from "../../schema/engagementHistory";
import { likes } from "../../schema/likes";
import { posts } from "../../schema/posts";

/** Filter out the engagements those are older than 30 days
 * @param column The date column.
 * @returns The filter function.
 */
export const recencyFilter = (column: PgColumn): SQL => {
    // Define the age limit.
    const maxAge = 1000 * 60 * 60 * 24 * 30 // 30 days
    const maxAgeDate = new Date(Date.now() - maxAge)
    return gt(column, maxAgeDate)
}

export async function updateUserEngagementHistory(userId: string) {
    const likesPerUser = db
        .select({
            posterId: likes.posterId,
            likes: count().as("like_count"),
            replies: sql<number>`0`.as("reply_count"),
            clicks: sql<number>`0`.as("click_count"),
        })
        .from(likes)
        .where(and(
            eq(likes.userId, userId),
            recencyFilter(likes.createdAt)
        ))
        .groupBy(likes.posterId)

    const clicksPerUser = db
        .select({
            posterId: clicks.posterId,
            likes: sql<number>`0`.as("like_count"),
            replies: sql<number>`0`.as("reply_count"),
            clicks: count().as("click_count"),
        })
        .from(clicks)
        .where(and(
            eq(clicks.userId, userId),
            recencyFilter(clicks.createdAt)
        ))
        .groupBy(clicks.posterId)

    const repliesPerUser = db
        .select({
            posterId: sql<string>`${posts.repliedUser}`,
            likes: sql<number>`0`.as("like_count"),
            replies: count().as("reply_count"),
            clicks: sql<number>`0`.as("click_count"),
        })
        .from(posts)
        .where(and(
            eq(posts.userId, userId),
            recencyFilter(posts.createdAt),
            isNotNull(posts.repliedUser)
        ))
        .groupBy(posts.repliedUser)

    const allEngagements = likesPerUser
        .unionAll(clicksPerUser)
        .unionAll(repliesPerUser)
        .as("all_engagement_counts")

    const engagementsPerUser = db
        .select({
            likes: sum(allEngagements.likes).as("likes_sum"),
            replies: sum(allEngagements.replies).as("replies_sum"),
            clicks: sum(allEngagements.clicks).as("clicks_sum"),
            viewerId: sql<string>`${userId}`.as("user_id"),
            publisherId: allEngagements.posterId,
        })
        .from(allEngagements)
        .groupBy(allEngagements.posterId)

    await db.transaction(async tx => {
        // Delete existing engagement histories
        await tx
            .delete(engagementHistory)
            .where(eq(engagementHistory.viewerId, userId))
        // Insert the new ones
        await tx
            .insert(engagementHistory)
            .select(engagementsPerUser)
    })
}