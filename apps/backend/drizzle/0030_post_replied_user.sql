ALTER TABLE "posts" drop COLUMN if exists "repliedUser";
ALTER TABLE "posts" ADD COLUMN "repliedUser" uuid;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_repliedUser_users_id_fk" FOREIGN KEY ("repliedUser") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;