CREATE TYPE "public"."notification_type" AS ENUM('like', 'reply', 'mention', 'follow');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"data" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"key" varchar(100) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "recent_notifications_of_user_idx" ON "notifications" USING btree ("userId","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "unread_notification_deduplication_idx" ON "notifications" USING btree ("userId","key","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "notification_cleanup_index" ON "notifications" USING btree ("createdAt");