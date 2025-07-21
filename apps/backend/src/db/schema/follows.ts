import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { index, pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

/** Follows between the users. */
export const follows = pgTable('follows', {
    followerId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    followedId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp().notNull().defaultNow(),
}, (t) => [
    primaryKey({ columns: [t.followerId, t.followedId] }),
    index().on(t.followedId, t.followerId, t.createdAt.desc()),
    index().on(t.followerId, t.followedId, t.createdAt.desc()),
]);

export type Follow = InferSelectModel<typeof follows>;

export type FollowToInsert = InferInsertModel<typeof follows>; 