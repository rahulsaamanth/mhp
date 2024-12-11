DO $$ BEGIN
 CREATE TYPE "public"."ProductStatus" AS ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "Product" ADD COLUMN "status" "ProductStatus" DEFAULT 'ACTIVE' NOT NULL;