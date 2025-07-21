DROP INDEX "postsKeywordIndex";--> statement-breakpoint
CREATE INDEX "searchLatestPostsIndex" ON "posts" USING gin ("createdAt" DESC NULLS LAST,to_tsvector('english', "text"));--> statement-breakpoint
CREATE INDEX "searchtopPostsIndex" ON "posts" USING gin ("engagementCount" DESC NULLS LAST,to_tsvector('english', "text"));--> statement-breakpoint
CREATE INDEX "searchLatestUserPostsIndex" ON "posts" USING btree ("userId","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "searchTopUserPostsIndex" ON "posts" USING btree ("userId","engagementCount" DESC NULLS LAST);