CREATE TYPE "public"."document_type" AS ENUM('invoice', 'delivery_challan', 'proforma_invoice', 'shipping_label', 'quotation', 'estimate');--> statement-breakpoint
CREATE TYPE "public"."page_size" AS ENUM('A4', 'A3', 'A5', 'Letter', 'Legal');--> statement-breakpoint
CREATE TABLE "document_settings" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"org_id" varchar(255) NOT NULL,
	"document_type" "document_type" NOT NULL,
	"prefix" varchar(50),
	"next_number" numeric(10, 0) DEFAULT '1' NOT NULL,
	"show_qr_code" boolean DEFAULT false NOT NULL,
	"page_size" "page_size" DEFAULT 'A4' NOT NULL,
	"terms_conditions" text,
	"notes" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document_settings" ADD CONSTRAINT "document_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_settings_user_id_idx" ON "document_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "document_settings_org_id_idx" ON "document_settings" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "document_settings_document_type_idx" ON "document_settings" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "document_settings_default_idx" ON "document_settings" USING btree ("is_default");