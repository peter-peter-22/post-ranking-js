ALTER TABLE "clicks" ADD COLUMN "posterId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "views" ADD COLUMN "posterId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_posterId_users_id_fk" FOREIGN KEY ("posterId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "views" ADD CONSTRAINT "views_posterId_users_id_fk" FOREIGN KEY ("posterId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;