import { eq, InferInsertModel, InferSelectModel, isNotNull, sql, SQL } from 'drizzle-orm';
import { boolean, index, jsonb, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const notificationTypeEnum = pgEnum('notification_type', [
    'like',
    'reply',
    'mention',
    'follow',
]);

/** The notifications of the users. */
export const notifications = pgTable('notifications', {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum().notNull(),
    data: jsonb(),
    secondaryData: jsonb(),
    createdAt: timestamp().notNull().defaultNow(),
    readAt: timestamp(),
    read: boolean().notNull().generatedAlwaysAs((): SQL => isNotNull(notifications.readAt)),
    // Unread notifications with the same key are merged.
    key: varchar({ length: 100 }).notNull()
}, (t) => [
    index("recent_notifications_of_user_idx").on(t.userId, t.read.desc(), t.createdAt.desc()),
    index("notification_cleanup_index").on(t.createdAt.asc()),
    uniqueIndex("unread_notifications_unique_idx").on(t.userId,t.key).where(eq(t.read, sql`false`))
]);

export type Notification = InferSelectModel<typeof notifications>;

export type NotificationToInsert = InferInsertModel<typeof notifications>; 