import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { index, integer, pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

/** Snapshots of the engagement histories. */
export const engagementHistorySnapshots = pgTable('engagement_history_snapshots', {
    likes: integer().notNull().default(0),
    replies: integer().notNull().default(0),
    clicks: integer().notNull().default(0),
    viewerId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    publisherId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp().notNull().defaultNow(),
}, (t) => [
    primaryKey({ columns: [t.viewerId, t.publisherId] }),
    index().on(t.viewerId, t.publisherId, t.createdAt.desc())
]);

export type EngagementHistoryShapshot = InferSelectModel<typeof engagementHistorySnapshots>;

export type EngagementHistoryShapshotToInsert = InferInsertModel<typeof engagementHistorySnapshots>;