DO $$ BEGIN
 CREATE TYPE "public"."priceCalcMode" AS ENUM('FORWARD', 'BACKWARD');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "ProductVariant" ADD COLUMN "priceCalcMode" "priceCalcMode" DEFAULT 'BACKWARD';