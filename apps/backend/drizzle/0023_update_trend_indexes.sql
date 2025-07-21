DROP INDEX if exists "trends_score_index";--> statement-breakpoint
DROP INDEX if exists "user_cluster_trends_keyword_clusterId_count_index";--> statement-breakpoint
DROP INDEX if exists "user_cluster_trends_keyword_count_index";--> statement-breakpoint
CREATE INDEX if not exists "trends_score_keyword_index" ON "trends" USING btree ("score" DESC NULLS LAST,"keyword" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX if not exists "user_cluster_trends_clusterId_count_keyword_index" ON "user_cluster_trends" USING btree ("clusterId","count" DESC NULLS LAST,"keyword" DESC NULLS LAST);