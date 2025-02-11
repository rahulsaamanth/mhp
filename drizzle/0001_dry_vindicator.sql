DO $$ BEGIN
 CREATE TYPE "public"."potencies" AS ENUM('NONE', '1X', '3X', '6X', '12X', '30X', '6C', '12C', '30C', '200C', '1M', '10M', '50M', 'CM', 'Q', 'LM1', 'LM2', 'LM3', 'LM4', 'LM5', 'LM6', 'LM7', 'LM8', 'LM9', 'LM10', 'LM11', 'LM12', 'LM13', 'LM14', 'LM15', 'LM16', 'LM17', 'LM18', 'LM19', 'LM20', 'LM21', 'LM22', 'LM23', 'LM24', 'LM25', 'LM26', 'LM27', 'LM28', 'LM29', 'LM30');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "ProductForm" ADD VALUE 'NONE';--> statement-breakpoint
ALTER TYPE "UnitOfMeasure" ADD VALUE 'NONE';--> statement-breakpoint
ALTER TYPE "UnitOfMeasure" ADD VALUE 'GM(s)';