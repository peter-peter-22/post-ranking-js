import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
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
    primaryKey({ name: "engagement_history_pk", columns: [t.viewerId, t.timeBucket, t.publisherId] }), // Used when looking up engagement histories from the last 1 month, and to enforce uniqueness when upserting the daily engagements
]);

export type EngagementHistory = InferSelectModel<typeof engagementHistory>;

export type EngagementHistoryToInsert = InferInsertModel<typeof engagementHistory>; 