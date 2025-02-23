ALTER TYPE "potency" ADD VALUE '200X';--> statement-breakpoint
ALTER TYPE "potency" ADD VALUE '6CH';--> statement-breakpoint
ALTER TYPE "potency" ADD VALUE '30CH';--> statement-breakpoint
ALTER TYPE "potency" ADD VALUE '200CH';--> statement-breakpoint
ALTER TYPE "potency" ADD VALUE '1000CH';--> statement-breakpoint
ALTER TABLE "ProductVariant" ALTER COLUMN "potency" SET NOT NULL;