CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"text" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"likeCount" integer DEFAULT 0 NOT NULL,
	"replyCount" integer DEFAULT 0 NOT NULL,
	"viewCount" integer DEFAULT 0 NOT NULL,
	"clickCount" integer DEFAULT 0 NOT NULL,
	"topic" varchar(50),
	"engaging" real DEFAULT 0 NOT NULL,
	"replyingTo" uuid,
	"engagementCount" integer GENERATED ALWAYS AS ((
            "posts"."likeCount" +
            "posts"."replyCount" +
            "posts"."clickCount" 
        )) STORED NOT NULL,
	"embeddingText" text,
	"embedding" vector(384),
	"keywords" varchar(50)[],
	"pending" boolean DEFAULT false NOT NULL,
	"media" jsonb,
	"commentScore" real GENERATED ALWAYS AS (
        (
            (("posts"."likeCount" + "posts"."replyCount" + "posts"."clickCount" + 10) / ("posts"."viewCount" + 10))::float 
            * 
            ("posts"."likeCount" + "posts"."replyCount" + "posts"."clickCount")::float
        )) STORED NOT NULL,
	CONSTRAINT "engaging clamp" CHECK ("posts"."engaging" >= 0 AND "posts"."engaging" <= 1)
);
--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "reply_to_post_fkey" FOREIGN KEY ("replyingTo") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "replyingToIndex" ON "posts" USING btree ("replyingTo","userId","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "userReplyHistoryIndex" ON "posts" USING btree ("userId","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "recencyIndex" ON "posts" USING btree ("createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "recentPostsIndex" ON "posts" USING btree ("replyingTo","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "postsKeywordIndex" ON "posts" USING gin ("keywords") WHERE "posts"."replyingTo" is null;--> statement-breakpoint
CREATE INDEX "orderRepliesByScoreIndex" ON "posts" USING btree ("replyingTo","commentScore" DESC NULLS LAST,"createdAt" DESC NULLS LAST) WHERE "posts"."replyingTo" is not null;