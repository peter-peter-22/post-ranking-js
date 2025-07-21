CREATE TABLE "clicks" (
	"postId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clicks_postId_userId_pk" PRIMARY KEY("postId","userId")
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"postId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "likes_postId_userId_pk" PRIMARY KEY("postId","userId")
);
--> statement-breakpoint
CREATE TABLE "views" (
	"postId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "views_postId_userId_pk" PRIMARY KEY("postId","userId")
);
--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "views" ADD CONSTRAINT "views_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "views" ADD CONSTRAINT "views_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_click_history" ON "clicks" USING btree ("userId","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "user_like_history" ON "likes" USING btree ("userId","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "user_view_history" ON "views" USING btree ("userId","createdAt" DESC NULLS LAST);