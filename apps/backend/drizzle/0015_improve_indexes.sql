ALTER TABLE "posts" DROP CONSTRAINT if exists "engaging clamp";--> statement-breakpoint
DROP INDEX if exists "userReplyHistoryIndex";--> statement-breakpoint
DROP INDEX if exists "recencyIndex";--> statement-breakpoint
DROP INDEX if exists "recentPostsIndex";--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN if not exists "isReply" boolean GENERATED ALWAYS AS ("posts"."replyingTo" is not null) STORED NOT NULL;--> statement-breakpoint
CREATE INDEX if not exists "userContentsIndex" ON "posts" USING btree ("userId","isReply","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX if not exists "pendingPostsIndex" ON "posts" USING btree ("createdAt") WHERE "posts"."pending" = true;--> statement-breakpoint
CREATE INDEX if not exists "recentPostsIndex" ON "posts" USING btree ("createdAt" DESC NULLS LAST) WHERE "posts"."replyingTo" is null;