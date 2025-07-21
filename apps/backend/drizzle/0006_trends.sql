CREATE TABLE "keyword_popularities" (
	"keyword" varchar(50) PRIMARY KEY NOT NULL,
	"posts" integer NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trends" (
	"keyword" varchar(50) PRIMARY KEY NOT NULL,
	"growth" real NOT NULL,
	"postCount" integer NOT NULL,
	"score" real GENERATED ALWAYS AS ("trends"."growth"::float*"trends"."postCount"::float) STORED NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_cluster_trends" (
	"keyword" varchar(50) NOT NULL,
	"clusterId" integer,
	"count" integer NOT NULL,
	CONSTRAINT "user_cluster_trends_clusterId_keyword_pk" PRIMARY KEY("clusterId","keyword")
);
--> statement-breakpoint
ALTER TABLE "user_cluster_trends" ADD CONSTRAINT "user_cluster_trends_clusterId_clusters_id_fk" FOREIGN KEY ("clusterId") REFERENCES "public"."clusters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "keyword_popularities_date_index" ON "keyword_popularities" USING btree ("date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "keyword_popularities_keyword_date_index" ON "keyword_popularities" USING btree ("keyword","date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "trends_score_index" ON "trends" USING btree ("score" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "user_cluster_trends_keyword_clusterId_count_index" ON "user_cluster_trends" USING btree ("keyword","clusterId","count");--> statement-breakpoint
CREATE INDEX "user_cluster_trends_keyword_count_index" ON "user_cluster_trends" USING btree ("keyword","count");