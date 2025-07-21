CREATE TABLE "engagement_history" (
	"likes" integer DEFAULT 0 NOT NULL,
	"replies" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"viewerId" uuid NOT NULL,
	"publisherId" uuid NOT NULL,
	CONSTRAINT "engagement_history_viewerId_publisherId_pk" PRIMARY KEY("viewerId","publisherId")
);
--> statement-breakpoint
ALTER TABLE "engagement_history" ADD CONSTRAINT "engagement_history_viewerId_users_id_fk" FOREIGN KEY ("viewerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_history" ADD CONSTRAINT "engagement_history_publisherId_users_id_fk" FOREIGN KEY ("publisherId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;