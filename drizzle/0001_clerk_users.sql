-- Recreate tables with Clerk integration
-- Drop existing tables completely
DROP TABLE IF EXISTS "clients" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Create users table with Clerk integration
CREATE TABLE "users" (
  "id" varchar(255) PRIMARY KEY,
  "name" varchar(255),
  "email" varchar(255) UNIQUE NOT NULL,
  "clerk_user_id" varchar(255) UNIQUE NOT NULL,
  "created_at" timestamp with time zone DEFAULT NOW() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT NOW() NOT NULL
);

-- Create index for clerk_user_id
CREATE INDEX "users_clerk_user_id_idx" ON "users" ("clerk_user_id");

-- Create clients table
CREATE TABLE "clients" (
  "id" varchar(255) PRIMARY KEY,
  "user_id" varchar(255) NOT NULL,
  "name" varchar(255) NOT NULL,
  "address" text,
  "gst" varchar(20),
  "mobile_no" varchar(15),
  "email" varchar(255),
  "company_name" varchar(255),
  "billing_main_address" text,
  "billing_pincode" varchar(10),
  "billing_city" varchar(100),
  "billing_state" varchar(100),
  "billing_country" varchar(100) DEFAULT 'India',
  "shipping_address" text,
  "created_at" timestamp with time zone DEFAULT NOW() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT NOW() NOT NULL,
  CONSTRAINT "clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create index for user_id
CREATE INDEX "clients_user_id_idx" ON "clients" ("user_id");
