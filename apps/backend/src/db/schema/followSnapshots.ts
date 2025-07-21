import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { boolean, index, pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

/** Snapshots of the follows. */
export const followSnapshots = pgTable('follow_snapshots', {
    followerId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    followedId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    isFollowing: boolean().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
}, (t) => [
    primaryKey({ columns: [t.followerId, t.followedId, t.createdAt] }),
    index().on(t.followerId, t.followedId, t.createdAt.desc())
]);

export type FollowShapshot = InferSelectModel<typeof followSnapshots>;

export type FollowShapshotToInsert = InferInsertModel<typeof followSnapshots>; 