import { and, eq } from "drizzle-orm";
import { db } from "../..";
import { redisClient } from "../../../redis/connect";
import { notifications } from "../../schema/notifications";
import { notificationRedisTTL, notificationsRedisKey } from "./common";
import { createPersistentSet, getPersistentSetLength } from "../../../redis/persistentSet";

export async function getNotificationCount(userId: string): Promise<number> {
    // Try to get the unread notification count from redis

    const redisKey = notificationsRedisKey(userId);

    const [countRedis] = await redisClient.multi()
        .sCard(redisKey)
        .expire(redisKey, notificationRedisTTL)
        .exec()

    const {length,exists} = getPersistentSetLength(countRedis ? parseInt(countRedis.toString()) : 0)
    if (exists) return length;

    // If it does not exists, get from the database then set in redis

    console.log("Notifications are not in redis, falling back to database");
    const keysFromDb = await getUnreadNotificationKeysFromDB(userId);
    await redisClient.multi()
        .sAdd(redisKey, createPersistentSet(keysFromDb.map(key => key.key)))
        .expire(redisKey, notificationRedisTTL)
        .exec()

    return keysFromDb.length;
}

async function getUnreadNotificationKeysFromDB(userId: string) {
    return await db
        .select({ key: notifications.key })
        .from(notifications)
        .where(and(
            eq(notifications.userId, userId),
            eq(notifications.read, false)
        ))
}