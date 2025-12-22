CREATE TABLE "bank_details" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"org_id" varchar(255) NOT NULL,
	"account_holder_name" varchar(255) NOT NULL,
	"bank_name" varchar(255) NOT NULL,
	"account_number" varchar(50) NOT NULL,
	"ifsc_code" varchar(20),
	"swift_code" varchar(20),
	"branch_name" varchar(255),
	"upi_id" varchar(255),
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_details" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"org_id" varchar(255) NOT NULL,
	"company_name" varchar(255),
	"legal_name" varchar(255),
	"address" text,
	"city" varchar(100),
	"state" varchar(100),
	"pincode" varchar(10),
	"gst" varchar(20),
	"pan" varchar(20),
	"email" varchar(255),
	"phone" varchar(20),
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bank_details" ADD CONSTRAINT "bank_details_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_details" ADD CONSTRAINT "company_details_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bank_details_user_id_idx" ON "bank_details" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bank_details_org_id_idx" ON "bank_details" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "bank_details_default_idx" ON "bank_details" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "company_details_user_id_idx" ON "company_details" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "company_details_org_id_idx" ON "company_details" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "company_details_default_idx" ON "company_details" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "company_details_gst_idx" ON "company_details" USING btree ("gst");