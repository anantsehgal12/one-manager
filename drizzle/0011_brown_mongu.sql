ALTER TABLE "organizations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "organizations" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_org_id_organizations_clerk_org_id_fk";
