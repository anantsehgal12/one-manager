-- Drop foreign key constraint linking users.org_id to organizations, if it exists
ALTER TABLE IF EXISTS "users" DROP CONSTRAINT IF EXISTS "users_org_id_organizations_clerk_org_id_fk";

-- Drop organizations table if it exists
DROP TABLE IF EXISTS "organizations";

-- Remove organization-related indexes if present
DROP INDEX IF EXISTS "organizations_clerk_org_id_idx";
DROP INDEX IF EXISTS "organizations_slug_idx";

-- In case any leftover constraints exist referencing organizations, attempt to drop them
-- (no-op if not present)
ALTER TABLE IF EXISTS "users" DROP CONSTRAINT IF EXISTS "users_org_id_fkey";
