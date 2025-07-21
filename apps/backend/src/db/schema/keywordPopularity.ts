import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { index, integer, pgTable, primaryKey, timestamp } from 'drizzle-orm/pg-core';
import { keyword } from '../common';

/** The popularity of the keywords per day. */
export const keywordPopularity = pgTable('keyword_popularities', {
    keyword: keyword().notNull(),
    posts: integer().notNull(),
    date: timestamp().notNull().defaultNow(),
}, (t) => [
    primaryKey({columns:[t.keyword,t.date]}),
    index().on(t.date.desc()),
    index().on(t.keyword, t.date.desc())
]);

export type KeywordPopularity = InferSelectModel<typeof keywordPopularity>;

export type KeywordPopularityToInsert = InferInsertModel<typeof keywordPopularity>; 