ALTER TABLE "clicks" DROP CONSTRAINT "clicks_posterId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "likes_posterId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_repliedUser_users_id_fk";
--> statement-breakpoint
ALTER TABLE "views" DROP CONSTRAINT "views_posterId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "clicks" DROP COLUMN "posterId";--> statement-breakpoint
ALTER TABLE "likes" DROP COLUMN "posterId";--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "repliedUser";--> statement-breakpoint
ALTER TABLE "views" DROP COLUMN "posterId";