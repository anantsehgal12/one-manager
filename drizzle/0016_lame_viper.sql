CREATE TYPE "public"."units" AS ENUM('pieces', 'kilograms', 'boxes', 'sets', 'units', 'others');--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "primary_units" SET DEFAULT 'pieces'::"public"."units";--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "primary_units" SET DATA TYPE "public"."units" USING "primary_units"::"public"."units";