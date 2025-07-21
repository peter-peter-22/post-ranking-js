import { InferSelectModel } from 'drizzle-orm';
import { integer, pgTable } from 'drizzle-orm/pg-core';

/** User clusters. */
export const clusters = pgTable('clusters', {
    id: integer().notNull().primaryKey(),// The id is assigned by the cluster generator
});

export type Cluster = InferSelectModel<typeof clusters>;