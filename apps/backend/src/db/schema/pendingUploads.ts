import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { index, pgTable, primaryKey, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

/** The pending uploads of the users. Used for tracking the max pending upload count and to identify failed/cancelled uploads. */
export const pendingUploads = pgTable('pending_uploads', {
    userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp().notNull().defaultNow(),
    bucketName: varchar({ length: 50 }).notNull(),
    objectName: varchar({ length: 200 }).notNull(),
}, (t) => [
    primaryKey({columns:[t.bucketName, t.objectName]}),
    index("pending_files_of_user").on(t.userId),
    index("pending_uploads_age").on(t.createdAt.desc())
]);

export type PendingUpload = InferSelectModel<typeof pendingUploads>;

export type PendingUploadToInsert = InferInsertModel<typeof pendingUploads>; 