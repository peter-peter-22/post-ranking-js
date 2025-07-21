import { z } from "zod"
import { apiClient } from "../api"
import { ServerMediaSchema } from "@me/schemas/src/zod/media"

const BaseNotificationSchema = z.object({
    id: z.string(),
    userId: z.string(),
    createdAt: z.coerce.date(),
    readAt: z.coerce.date().nullable(),
    read: z.boolean().default(false)
})

const UserPreviewSchema = z.object({
    name: z.string(),
    handle: z.string(),
    avatar: ServerMediaSchema.nullable()
})

const PostPreviewSchema = z.object({
    text: z.string(),
    media: ServerMediaSchema.array().nullable(),
    id: z.string()
})

const PostWithUserPreviewSchema = z.object({
    user: UserPreviewSchema,
    post: PostPreviewSchema
})

const LikeNotificationSchema = BaseNotificationSchema.extend({
    type: z.literal("like"),
    data: z.object({
        postId: z.string()
    }),
    secondaryData: z.object({
        users: UserPreviewSchema.array(),
        post: PostPreviewSchema,
        count: z.number()
    })
});

const ReplyNotificationSchema = BaseNotificationSchema.extend({
    type: z.literal("reply"),
    data: z.object({
        postId: z.string()
    }),
    secondaryData: z.object({
        replies: PostWithUserPreviewSchema.array(),
        post: PostPreviewSchema,
        count: z.number()
    })
});

const FollowNotificationSchema = BaseNotificationSchema.extend({
    type: z.literal("follow"),
    secondaryData: z.object({
        users: UserPreviewSchema.array(),
        count: z.number()
    })
});

const MentionNotificationSchema = BaseNotificationSchema.extend({
    type: z.literal("mention"),
    data: z.object({
        postId: z.string()
    }),
    secondaryData: z.object({
        mention: PostWithUserPreviewSchema,
    })
});

const NotificationSchema = z.discriminatedUnion("type", [
    LikeNotificationSchema,
    ReplyNotificationSchema,
    FollowNotificationSchema,
    MentionNotificationSchema
]);

const NotificationListResponseSchema = z.object({
    notifications: z.array(NotificationSchema),
})

export async function notificationListAll(start: Date, offset?: number) {
    const res = await apiClient.post("/userActions/notifications", { offset })
    const { notifications } = NotificationListResponseSchema.parse(res.data)
    notifications.forEach(n => { n.read = n.readAt !== null && n.readAt.getTime() < start.getTime() })
    return notifications
}

export async function notificationListMentions(start: Date, offset?: number) {
    const res = await apiClient.post("/userActions/notifications/mentions", { offset })
    const { notifications } = NotificationListResponseSchema.parse(res.data)
    notifications.forEach(n => { n.read = n.readAt !== null && n.readAt.getTime() < start.getTime() })
    return notifications
}

export type Notification = z.infer<typeof NotificationSchema>
export type LikeNotification = z.infer<typeof LikeNotificationSchema>
export type ReplyNotification = z.infer<typeof ReplyNotificationSchema>
export type FollowNotification = z.infer<typeof FollowNotificationSchema>
export type MentionNotification = z.infer<typeof MentionNotificationSchema>
export type PostPreview = z.infer<typeof PostPreviewSchema>
export type UserPreview = z.infer<typeof UserPreviewSchema>
export type PostWithUserPreview = z.infer<typeof PostWithUserPreviewSchema>