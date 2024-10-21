DO $$ BEGIN
 CREATE TYPE "public"."AdressType" AS ENUM('SHIPPING', 'BILLING');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."DeliveryStatus" AS ENUM('PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."PaymentType" AS ENUM('CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'WALLET');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Address" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"userId" varchar(32) NOT NULL,
	"street" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"postalCode" varchar(10) NOT NULL,
	"country" varchar(50) DEFAULT 'India' NOT NULL,
	"addressType" "AdressType" DEFAULT 'SHIPPING' NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PaymentMethod" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"userId" varchar(32) NOT NULL,
	"paymentType" "PaymentType" NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"paymentDetails" jsonb NOT NULL,
	"displayDetails" jsonb NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Review" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "Order" ADD COLUMN "deliveryStatus" "DeliveryStatus" DEFAULT 'PROCESSING' NOT NULL;--> statement-breakpoint
ALTER TABLE "Order" ADD COLUMN "shippingAddress" varchar(32) NOT NULL;--> statement-breakpoint
ALTER TABLE "Order" ADD COLUMN "billingAddress" varchar(32) NOT NULL;--> statement-breakpoint
ALTER TABLE "Order" ADD COLUMN "paymentMethodId" varchar(32);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Adress_userId_index" ON "Address" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "PaymentMethod_userId_index" ON "PaymentMethod" USING btree ("userId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingAddress_fkey" FOREIGN KEY ("shippingAddress") REFERENCES "public"."Address"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Order" ADD CONSTRAINT "Order_billingAddress_fkey" FOREIGN KEY ("billingAddress") REFERENCES "public"."Address"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Order" ADD CONSTRAINT "Order_paymentMethod_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "public"."PaymentMethod"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "User" DROP COLUMN IF EXISTS "shippingAddress";--> statement-breakpoint
ALTER TABLE "User" DROP COLUMN IF EXISTS "billingAddress";