import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { index, integer, pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import { posts } from './posts';

/** The snapshots of the post engagement counts. */
export const postSnapshots = pgTable('post_snapshots', {
    postId: uuid().notNull().references(() => posts.id,{onDelete:"cascade"}),
    likeCount:integer().notNull().default(0),
    replyCount:integer().notNull().default(0),
    clickCount:integer().notNull().default(0),
    viewCount:integer().notNull().default(0),
    createdAt: timestamp().notNull().defaultNow(),
}, (t) => [
    primaryKey({columns:[t.postId,t.createdAt]}),
    index().on(t.postId,t.createdAt.desc())
]);

export type PostSnapshot = InferSelectModel<typeof postSnapshots>;

export type PostSnapshotToInsert = InferInsertModel<typeof postSnapshots>; 