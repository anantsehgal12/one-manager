CREATE TYPE "public"."payment_mode" AS ENUM('Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque', 'Other');--> statement-breakpoint
CREATE TABLE "payment_records" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"org_id" varchar(255) NOT NULL,
	"invoice_id" varchar(255) NOT NULL,
	"client_id" varchar(255) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"payment_mode" "payment_mode" NOT NULL,
	"notes" text,
	"is_fully_paid" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "bank_details_id" varchar(255);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "signature_id" varchar(255);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "initial_payment_record_id" varchar(255);--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payment_records_user_id_idx" ON "payment_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payment_records_org_id_idx" ON "payment_records" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "payment_records_invoice_id_idx" ON "payment_records" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "payment_records_client_id_idx" ON "payment_records" USING btree ("client_id");--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_bank_details_id_bank_details_id_fk" FOREIGN KEY ("bank_details_id") REFERENCES "public"."bank_details"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_signature_id_signatures_id_fk" FOREIGN KEY ("signature_id") REFERENCES "public"."signatures"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_initial_payment_record_id_payment_records_id_fk" FOREIGN KEY ("initial_payment_record_id") REFERENCES "public"."payment_records"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invoices_bank_details_id_idx" ON "invoices" USING btree ("bank_details_id");--> statement-breakpoint
CREATE INDEX "invoices_signature_id_idx" ON "invoices" USING btree ("signature_id");--> statement-breakpoint
CREATE INDEX "invoices_initial_payment_record_id_idx" ON "invoices" USING btree ("initial_payment_record_id");