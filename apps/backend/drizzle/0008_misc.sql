CREATE TABLE "pending_uploads" (
	"userId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"bucketName" varchar(50) NOT NULL,
	"objectName" varchar(200) NOT NULL,
	CONSTRAINT "pending_uploads_bucketName_objectName_pk" PRIMARY KEY("bucketName","objectName")
);
--> statement-breakpoint
CREATE TABLE "persistent_dates" (
	"id" text PRIMARY KEY NOT NULL,
	"timestamp" timestamp DEFAULT '1970-01-01 00:00:00.000' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pending_uploads" ADD CONSTRAINT "pending_uploads_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pending_files_of_user" ON "pending_uploads" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "pending_uploads_age" ON "pending_uploads" USING btree ("createdAt" DESC NULLS LAST);