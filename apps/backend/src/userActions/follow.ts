import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { follows } from "../db/schema/follows";
import { incrementFollowingCounter } from "../jobs/followingCount";
import { incrementFollowerCounter } from "../jobs/followerCount";
import { createFollowNotification } from "../db/controllers/notifications/createNotification";

/**
 * Make a user follow another
 * @param followerId The initiator of the following
 * @param followedId The followed user
 */
export async function follow(followerId: string, followedId: string) {
    const [updated] = await db.insert(follows)
        .values({
            followedId,
            followerId
        })
        .onConflictDoNothing()
        .returning()
    if (updated)
        await Promise.all([
            incrementFollowerCounter(followedId, 1),
            incrementFollowingCounter(followerId, 1),
            createFollowNotification(followedId, updated.createdAt)
        ])
}

/**
 * Delete a follow
 * @param followerId The initiator of the following
 * @param followedId The followed user
 */
export async function unfollow(followerId: string, followedId: string) {
    const updated = await db.delete(follows)
        .where(and(
            eq(follows.followerId, followerId),
            eq(follows.followedId, followedId)
        ))
        .returning()
    if (updated.length !== 0)
        await Promise.all([
            incrementFollowerCounter(followerId, -1),
            incrementFollowingCounter(followedId, -1)
        ])
}