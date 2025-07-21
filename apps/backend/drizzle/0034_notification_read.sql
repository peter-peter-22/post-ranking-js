ALTER TABLE "notifications" DROP COLUMN IF EXISTS "read";
ALTER TABLE "notifications" DROP COLUMN IF EXISTS "readAt";
DROP INDEX IF EXISTS "unread_notification_deduplication_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "recent_notifications_of_user_idx";--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "readAt" timestamp;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "read" boolean GENERATED ALWAYS AS ("notifications"."readAt" is not null) STORED NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "unread_notifications_unique_idx" ON "notifications" USING btree ("userId","key") WHERE "notifications"."read" = false;--> statement-breakpoint
CREATE INDEX "recent_notifications_of_user_idx" ON "notifications" USING btree ("userId","read" DESC NULLS LAST,"createdAt" DESC NULLS LAST);