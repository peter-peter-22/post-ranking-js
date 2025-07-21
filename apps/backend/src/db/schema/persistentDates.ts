import { InferInsertModel } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/** Dates saved in the database with string keys. */
export const persistentDates = pgTable('persistent_dates', {
    id: text().notNull().primaryKey(),
    timestamp: timestamp().notNull().default(new Date(0)),
});

export type UpdateToInsert = InferInsertModel<typeof persistentDates>; 