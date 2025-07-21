import { InferInsertModel, InferSelectModel, SQL, sql } from 'drizzle-orm';
import { index, integer, pgTable, real } from 'drizzle-orm/pg-core';
import { keyword } from '../common';

/** The trend scores at the time. */
export const trends = pgTable('trends', {
    keyword: keyword().notNull().primaryKey(),
    growth: real().notNull(),
    postCount: integer().notNull(),
    score: real().generatedAlwaysAs((): SQL => sql`${trends.growth}::float*${trends.postCount}::float`).notNull()
}, (t) => [
    index().on(t.score.desc(),t.keyword.desc()), // Get top trends with pagination
    index().on(t.keyword,t.postCount.desc()) // Hashtag prediction in post editor
]);

export type Trend = InferSelectModel<typeof trends>;

export type TrendToInsert = InferInsertModel<typeof trends>; 