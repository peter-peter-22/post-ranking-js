import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { index, integer, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

/** Engagement histories between the users. */
export const engagementHistory = pgTable('engagement_history', {
    likes: integer().notNull().default(0),
    replies: integer().notNull().default(0),
    clicks: integer().notNull().default(0),
    viewerId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    publisherId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    timeBucket: integer().notNull()
}, (t) => [
    primaryKey({ columns: [t.viewerId, t.timeBucket, t.publisherId] }), // Used when looking up engagement histories from the last 1 month, and to enforce uniqueness
    index().on(t.viewerId, t.likes.desc()) // Used in "who to follow" dialog to get the top engaged users of a viewer
]);

export type EngagementHistory = InferSelectModel<typeof engagementHistory>;

export type EngagementHistoryToInsert = InferInsertModel<typeof engagementHistory>; 