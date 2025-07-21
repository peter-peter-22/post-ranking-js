DROP INDEX "follows_followedId_followerId_index";--> statement-breakpoint
CREATE INDEX "follows_followedId_followerId_createdAt_index" ON "follows" USING btree ("followedId","followerId","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "follows_followerId_followedId_createdAt_index" ON "follows" USING btree ("followerId","followedId","createdAt" DESC NULLS LAST);