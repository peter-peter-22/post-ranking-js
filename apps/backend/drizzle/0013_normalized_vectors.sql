ALTER TABLE "posts" ADD COLUMN if not exists "embedding_normalized" vector(384);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN if not exists "embedding_normalized" vector(384);