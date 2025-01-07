ALTER TABLE "OrderDetails" DROP CONSTRAINT "OrderDetails_productVariantId_fkey";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "OrderDetails" ADD CONSTRAINT "OrderDetails_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "public"."ProductVariant"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
