CREATE TABLE "engagement_history_snapshots" (
	"viewerId" uuid NOT NULL,
	"posterId" uuid NOT NULL,
	"likeCount" integer DEFAULT 0 NOT NULL,
	"replyCount" integer DEFAULT 0 NOT NULL,
	"clickCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "engagement_history_snapshots_viewerId_posterId_pk" PRIMARY KEY("viewerId","posterId")
);
--> statement-breakpoint
CREATE TABLE "follow_snapshots" (
	"followerId" uuid NOT NULL,
	"followedId" uuid NOT NULL,
	"isFollowing" boolean NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "follow_snapshots_followerId_followedId_createdAt_pk" PRIMARY KEY("followerId","followedId","createdAt")
);
--> statement-breakpoint
CREATE TABLE "post_snapshots" (
	"postId" uuid NOT NULL,
	"likeCount" integer DEFAULT 0 NOT NULL,
	"replyCount" integer DEFAULT 0 NOT NULL,
	"clickCount" integer DEFAULT 0 NOT NULL,
	"viewCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_snapshots_postId_createdAt_pk" PRIMARY KEY("postId","createdAt")
);
--> statement-breakpoint
CREATE TABLE "user_embedding_snapshots" (
	"userId" uuid NOT NULL,
	"embedding" vector(384) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_embedding_snapshots_userId_createdAt_pk" PRIMARY KEY("userId","createdAt")
);
--> statement-breakpoint
ALTER TABLE "engagement_history_snapshots" ADD CONSTRAINT "engagement_history_snapshots_viewerId_users_id_fk" FOREIGN KEY ("viewerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_history_snapshots" ADD CONSTRAINT "engagement_history_snapshots_posterId_users_id_fk" FOREIGN KEY ("posterId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_snapshots" ADD CONSTRAINT "follow_snapshots_followerId_users_id_fk" FOREIGN KEY ("followerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_snapshots" ADD CONSTRAINT "follow_snapshots_followedId_users_id_fk" FOREIGN KEY ("followedId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_snapshots" ADD CONSTRAINT "post_snapshots_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_embedding_snapshots" ADD CONSTRAINT "user_embedding_snapshots_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "engagement_history_snapshots_viewerId_posterId_createdAt_index" ON "engagement_history_snapshots" USING btree ("viewerId","posterId","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "follow_snapshots_followerId_followedId_createdAt_index" ON "follow_snapshots" USING btree ("followerId","followedId","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "post_snapshots_postId_createdAt_index" ON "post_snapshots" USING btree ("postId","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "user_embedding_snapshots_userId_createdAt_index" ON "user_embedding_snapshots" USING btree ("userId","createdAt" DESC NULLS LAST);