CREATE TABLE "engagement_history" (
	"likes" integer DEFAULT 0 NOT NULL,
	"replies" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"viewerId" uuid NOT NULL,
	"publisherId" uuid NOT NULL,
	"timeBucket" integer NOT NULL,
	CONSTRAINT "engagement_history_pk" PRIMARY KEY("viewerId","timeBucket","publisherId")
);
--> statement-breakpoint
CREATE TABLE "engagement_history_snapshots" (
	"likes" integer DEFAULT 0 NOT NULL,
	"replies" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"viewerId" uuid NOT NULL,
	"publisherId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "engagement_history_snapshots_viewerId_publisherId_pk" PRIMARY KEY("viewerId","publisherId")
);
--> statement-breakpoint
ALTER TABLE "engagement_history" ADD CONSTRAINT "engagement_history_viewerId_users_id_fk" FOREIGN KEY ("viewerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_history" ADD CONSTRAINT "engagement_history_publisherId_users_id_fk" FOREIGN KEY ("publisherId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_history_snapshots" ADD CONSTRAINT "engagement_history_snapshots_viewerId_users_id_fk" FOREIGN KEY ("viewerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagement_history_snapshots" ADD CONSTRAINT "engagement_history_snapshots_publisherId_users_id_fk" FOREIGN KEY ("publisherId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "engagement_history_snapshots_viewerId_publisherId_createdAt_index" ON "engagement_history_snapshots" USING btree ("viewerId","publisherId","createdAt" DESC NULLS LAST);