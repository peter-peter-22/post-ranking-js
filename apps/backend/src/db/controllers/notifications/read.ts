import { and, count, desc, eq, gte, or, sql } from "drizzle-orm";
import { db } from "../..";
import { redisClient } from "../../../redis/connect";
import { follows } from "../../schema/follows";
import { likes } from "../../schema/likes";
import { notifications } from "../../schema/notifications";
import { posts } from "../../schema/posts";
import { users } from "../../schema/users";
import { notificationRedisTTL, notificationsPerPage, notificationsRedisKey, redisSetPlaceholder, userPreviewsPerNotification } from "./common";

export async function prepareNotifications(userId: string, offset: number) {
    // If this is the first page, calcualte the secondary data of the notifications and clear redis
    if (offset === 0) {
        const key = notificationsRedisKey(userId)
        await Promise.all([
            ensureData(userId),
            redisClient.multi()
                .del(key)
                .sAdd(key, redisSetPlaceholder)
                .expire(key, notificationRedisTTL)
                .exec()
        ])
    }
}

export async function notificationList(userId: string, offset: number) {
    await prepareNotifications(userId, offset)
    return await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt), desc(notifications.read))
        .offset(offset)
        .limit(notificationsPerPage)
}

export async function notificationListMentions(userId: string, offset: number) {
    await prepareNotifications(userId, offset)
    return await db
        .select()
        .from(notifications)
        .where(and(
            eq(notifications.userId, userId),
            or(
                eq(notifications.type, "mention"),
                eq(notifications.type, "reply")
            )
        ))
        .orderBy(desc(notifications.createdAt), desc(notifications.read))
        .offset(offset)
        .limit(notificationsPerPage)
}

async function ensureData(userId: string) {
    /** Get the columns of post previews. */
    const postJson = sql`
    json_build_object(
        'text',${posts.text},
        'media',${posts.media},
        'id',${posts.id}
    )`

    /** Get the columns of user previews. */
    const userJson = sql`
    json_build_object(
        'name', ${users.name},
        'handle', ${users.handle},
        'avatar', ${users.avatar}
    )`

    /** Get the columns of reply preview. */
    const postWithUserJson = sql`
    json_build_object(
        'post',${postJson},
        'user',${userJson}
    )`

    /** On-demand data for like notifications. */
    const likeExtraData = sql`
    json_build_object(
        'users', 
        array(${db
            .select({ user: userJson })
            .from(likes)
            .where(and(
                eq(likes.postId, sql`(${notifications.data}->>'postId')::uuid`),
                gte(likes.createdAt, notifications.createdAt)
            ))
            .innerJoin(users, eq(users.id, likes.userId))
            .orderBy(desc(likes.createdAt))
            .limit(userPreviewsPerNotification)
        }),
        'post',
        ${db
            .select({ post: postJson })
            .from(posts)
            .where(eq(posts.id, sql`(${notifications.data}->>'postId')::uuid`))
        },
        'count',
        ${db
            .select({ count: count() })
            .from(likes)
            .where(and(
                eq(likes.postId, sql`(${notifications.data}->>'postId')::uuid`),
                gte(likes.createdAt, notifications.createdAt)
            ))
        }
    )`

    /** On-demand data for reply notifications. */
    const replyExtraData = sql`
    json_build_object(
        'replies', 
        array(${db
            .select({
                postWithUser: postWithUserJson
            })
            .from(posts)
            .where(and(
                eq(posts.replyingTo, sql`(${notifications.data}->>'postId')::uuid`),
                gte(posts.createdAt, notifications.createdAt)
            ))
            .innerJoin(users, eq(users.id, posts.userId))
            .orderBy(desc(posts.createdAt))
            .limit(userPreviewsPerNotification)
        }),
        'post',
        ${db
            .select({ post: postJson })
            .from(posts)
            .where(eq(posts.id, sql`(${notifications.data}->>'postId')::uuid`))
        },
        'count',
        ${db
            .select({ count: count() })
            .from(posts)
            .where(and(
                eq(posts.replyingTo, sql`(${notifications.data}->>'postId')::uuid`),
                gte(posts.createdAt, notifications.createdAt)
            ))
        }
    )`

    /** On-demand data for follow notifications. */
    const followExtraData = sql`
    json_build_object(
        'users', 
        array(${db
            .select({
                user: userJson
            })
            .from(follows)
            .where(and(
                eq(follows.followedId, userId),
                gte(follows.createdAt, notifications.createdAt)
            ))
            .innerJoin(users, eq(users.id, follows.followerId))
            .orderBy(desc(follows.createdAt))
            .limit(userPreviewsPerNotification)
        }),
        'count',
        ${db
            .select({ count: count() })
            .from(follows)
            .where(and(
                eq(follows.followedId, userId),
                gte(follows.createdAt, notifications.createdAt)
            ))
        }
    )`

    /** On-demand data for mention notifications. */
    const mentionExtraData = sql`
    json_build_object(
        'mention', 
        ${db
            .select({
                postWithUser: postWithUserJson
            })
            .from(posts)
            .where(and(
                eq(posts.id, sql`(${notifications.data}->>'postId')::uuid`),
            ))
            .innerJoin(users, eq(users.id, posts.userId))
        }
    )`

    /** Select the notifications and generate their extra data when they are viewed for the first time. */
    await db
        .update(notifications)
        .set({
            readAt: new Date(),
            secondaryData: sql`
            case 
                when ${eq(notifications.type, "like")}
                then ${likeExtraData}
                when ${eq(notifications.type, "reply")}
                then ${replyExtraData}
                when ${eq(notifications.type, "follow")}
                then ${followExtraData}
                when ${eq(notifications.type, "mention")}
                then ${mentionExtraData}
            else null end`
        })
        .where(and(
            eq(notifications.userId, userId),
            eq(notifications.read, false)
        ))
}