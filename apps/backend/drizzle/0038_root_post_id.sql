ALTER TABLE "posts" ADD COLUMN "rootPostId" uuid;--> statement-breakpoint
CREATE INDEX "rootPostIndex" ON "posts" USING btree ("rootPostId");