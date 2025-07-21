CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"handle" varchar(50) NOT NULL,
	"name" varchar(50) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"followerCount" integer DEFAULT 0 NOT NULL,
	"interests" varchar(50)[] DEFAULT '{}' NOT NULL,
	"bot" boolean DEFAULT false NOT NULL,
	"embedding" vector(384),
	"clusterId" integer,
	CONSTRAINT "users_handle_unique" UNIQUE("handle"),
	CONSTRAINT "users_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_clusterId_clusters_id_fk" FOREIGN KEY ("clusterId") REFERENCES "public"."clusters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_clusterId_index" ON "users" USING btree ("clusterId");