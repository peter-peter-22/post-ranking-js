import { and, eq } from "drizzle-orm";
import { db } from "../..";
import { redisClient } from "../../../redis/connect";
import { notifications } from "../../schema/notifications";
import { notificationRedisTTL, notificationsRedisKey, redisSetPlaceholder } from "./common";

export async function getNotificationCount(userId: string): Promise<number> {
    // Try to get the unread notification count from redis

    const redisKey = notificationsRedisKey(userId);

    const [countRedis] = await redisClient.multi()
        .sCard(redisKey)
        .expire(redisKey, notificationRedisTTL)
        .exec()

    const count = countRedis ? parseInt(countRedis.toString()) : 0
    const realCount = count - 1
    const exists = count > 0

    if (exists) return realCount;

    // If it does not exists, get from the database then set in redis

    console.log("Notifications are not in redis, falling back to database");
    const keysFromDb = await getUnreadNotificationKeysFromDB(userId);
    if (keysFromDb.length > 0) {
        await redisClient.multi()
            .sAdd(redisKey, [redisSetPlaceholder, ...keysFromDb.map(key => key.key)])
            .expire(redisKey, notificationRedisTTL)
    }

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