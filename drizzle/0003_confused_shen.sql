DO $$ BEGIN
 CREATE TYPE "public"."SKULocation" AS ENUM('MANGALORE-01', 'MANGALORE-02', 'KERALA-01');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "Product" ADD COLUMN "skuLocation" "SKULocation" DEFAULT 'MANGALORE-01' NOT NULL;