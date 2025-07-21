DROP INDEX if exists "recentPostsESimIndex";--> statement-breakpoint
CREATE INDEX "recentPostsESimIndex" ON "posts" USING hnsw ("timeBucket","embedding_normalized" vector_l2_ops);