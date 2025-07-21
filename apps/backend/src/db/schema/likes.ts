import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { index, pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import { posts } from './posts';
import { users } from './users';

/** The likes of the posts. */
export const likes = pgTable('likes', {
    postId: uuid().notNull().references(() => posts.id, { onDelete: "cascade" }),
    userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    posterId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp().notNull().defaultNow(),
}, (t) => [
    primaryKey({columns:[t.postId, t.userId]}),
    index("user_like_history").on(t.userId, t.createdAt.desc())
]);

export type Like = InferSelectModel<typeof likes>;

export type LikeToInsert = InferInsertModel<typeof likes>; 