CREATE TABLE "follows" (
	"followerId" uuid NOT NULL,
	"followedId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "follows_followerId_followedId_pk" PRIMARY KEY("followerId","followedId")
);
--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_followerId_users_id_fk" FOREIGN KEY ("followerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_followedId_users_id_fk" FOREIGN KEY ("followedId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "follows_followedId_followerId_index" ON "follows" USING btree ("followedId","followerId");