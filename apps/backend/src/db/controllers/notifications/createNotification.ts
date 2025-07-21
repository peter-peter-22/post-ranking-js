import { inArray } from "drizzle-orm";
import { db } from "../..";
import { redisClient } from "../../../redis/connect";
import { notifications } from "../../schema/notifications";
import { notificationsRedisKey } from "./common";
import { users } from "../../schema/users";

export async function createLikeNotification(recipientId: string, postId: string, date:Date) {
    // Upsert the notification key to redis
    const key = `likes/${postId}`
    const isNew = await checkAndSetNotificationKey(recipientId, key)
    // If the key was present in redis before, then do nothing, the notification is already in the database
    if (!isNew) return
    // If the key was not present in redis before, then create the notification in the database
    await db
        .insert(notifications)
        .values({
            userId: recipientId,
            type: "like",
            data: { postId: postId },
            createdAt:date,
            key
        })
        // Handle duplicate inserts in case of redis expiration
        .onConflictDoNothing()
}

export async function createReplyNotification(recipientId: string, postId: string, date:Date) {
    // Upsert the notification key to redis
    const key = `reply/${postId}`
    const isNew = await checkAndSetNotificationKey(recipientId, key)
    // If the key was present in redis before, then do nothing, the notification is already in the database
    if (!isNew) return
    // If the key was not present in redis before, then create the notification in the database
    await db
        .insert(notifications)
        .values({
            userId: recipientId,
            type: "reply",
            data: { postId: postId },
            createdAt:date,
            key
        })
        // Handle duplicate inserts in case of redis expiration
        .onConflictDoNothing()
}

export async function createFollowNotification(recipientId: string, date:Date) {
    // Upsert the notification key to redis
    const key = `follow`
    const isNew = await checkAndSetNotificationKey(recipientId, key)
    // If the key was present in redis before, then do nothing, the notification is already in the database
    if (!isNew) return
    // If the key was not present in redis before, then create the notification in the database
    await db
        .insert(notifications)
        .values({
            userId: recipientId,
            type: "follow",
            createdAt:date,
            key
        })
        // Handle duplicate inserts in case of redis expiration
        .onConflictDoNothing()
}

export async function createMentionNotifications(mentionedHandles: string[]|null, postId: string,date:Date) {
    if (!mentionedHandles || mentionedHandles.length === 0) return
    // Select the affected users
    const mentionedUsers = await db.select({ id: users.id }).from(users).where(inArray(users.handle, mentionedHandles))
    if (mentionedUsers.length === 0) return
    // Process the notification for each mentioned user
    await Promise.all(
        mentionedUsers.map(user => mentionSingleUser(user.id, postId,date))
    )
}

async function mentionSingleUser(recipientId: string, postId: string,date:Date) {
    // Upsert the notification key to redis
    const key = `mention/${postId}`
    const isNew = await checkAndSetNotificationKey(recipientId, key)
    // If the key was present in redis before, then do nothing, the notification is already in the database
    if (!isNew) return
    // If the key was not present in redis before, then create the notification in the database
    await db
        .insert(notifications)
        .values({
            userId: recipientId,
            type: "mention",
            data: { postId: postId },
            createdAt:date,
            key
        })
        // Handle duplicate inserts in case of redis expiration
        .onConflictDoNothing()
}

export async function checkAndSetNotificationKey(
    userId: string,
    notificationKey: string
): Promise<boolean> {
    const isNew = await redisClient.sAdd(notificationsRedisKey(userId), notificationKey);
    return isNew === 1; // 1 = added, 0 = already existed
}
