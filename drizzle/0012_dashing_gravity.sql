CREATE TABLE "signatures" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"org_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"image_url" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "signatures" ADD CONSTRAINT "signatures_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "signatures_user_id_idx" ON "signatures" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "signatures_org_id_idx" ON "signatures" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "signatures_default_idx" ON "signatures" USING btree ("is_default");