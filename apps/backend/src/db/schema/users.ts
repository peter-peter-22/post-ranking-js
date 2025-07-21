import { getTableColumns, InferInsertModel, InferSelectModel, SQL, sql } from 'drizzle-orm';
import { boolean, index, integer, jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { embeddingVector, MediaFile } from '../common';
import { clusters } from '../schema/clusters';

/** The users. */
export const users = pgTable('users', {
    id: uuid().defaultRandom().primaryKey(),
    handle: varchar({ length: 50 }).notNull().unique(),
    name: varchar({ length: 50 }).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    followerCount: integer().notNull().default(0),
    followingCount: integer().notNull().default(0),
    interests: varchar({ length: 50 }).array().notNull().default([]),//what kinds of posts the bot user creates and wants to see
    bot: boolean().notNull().default(false),
    embedding: embeddingVector("embedding"),
    embeddingNormalized: embeddingVector("embedding_normalized"),
    clusterId: integer().references(() => clusters.id, { onDelete: "set null" }),
    fullName: varchar({ length: 101 }).generatedAlwaysAs((): SQL => sql`${users.name} || ' ' || ${users.handle}`),
    avatar: jsonb().$type<MediaFile>(),
    banner: jsonb().$type<MediaFile>(),
    bio: varchar({ length: 500 })
}, (t) => [
    index().on(t.clusterId),
    index('user_name_search_index').using('gin', t.fullName.op("gin_trgm_ops")), // user search
    index().on(t.followerCount.desc(), t.id.desc()), // user search
    index().on(t.handle),
    index().on(t.handle, t.followerCount.desc()) //mention prediction
]);

export type User = InferSelectModel<typeof users>;

export type UserToInsert = InferInsertModel<typeof users>;

const {embedding,embeddingNormalized,bot,fullName,interests,...userColumns}=getTableColumns(users)
export {userColumns}
export type UserCommon = Pick<User, keyof typeof userColumns>;