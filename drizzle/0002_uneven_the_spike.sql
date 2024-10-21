ALTER TABLE "ProductVariant" ADD COLUMN "variantImage" text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "Product" DROP COLUMN IF EXISTS "image";