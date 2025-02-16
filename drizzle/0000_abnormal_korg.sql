DO $$ BEGIN
 CREATE TYPE "public"."AddressType" AS ENUM('SHIPPING', 'BILLING');
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
 CREATE TYPE "public"."MovementType" AS ENUM('IN', 'OUT', 'ADJUSTMENT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."OrderType" AS ENUM('OFFLINE', 'ONLINE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."PaymentStatus" AS ENUM('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED');
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
DO $$ BEGIN
 CREATE TYPE "public"."potencies" AS ENUM('NONE', '1X', '3X', '6X', '12X', '30X', '6C', '12C', '30C', '200C', '1M', '10M', '50M', 'CM', 'Q', 'LM1', 'LM2', 'LM3', 'LM4', 'LM5', 'LM6', 'LM7', 'LM8', 'LM9', 'LM10', 'LM11', 'LM12', 'LM13', 'LM14', 'LM15', 'LM16', 'LM17', 'LM18', 'LM19', 'LM20', 'LM21', 'LM22', 'LM23', 'LM24', 'LM25', 'LM26', 'LM27', 'LM28', 'LM29', 'LM30');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."ProductForm" AS ENUM('NONE', 'DILUTIONS(P)', 'MOTHER_TINCTURES(Q)', 'TRITURATIONS', 'TABLETS', 'GLOBULES', 'BIO_CHEMIC', 'BIO_COMBINATION', 'OINTMENT', 'GEL', 'CREAM', 'SYRUP/TONIC', 'DROPS', 'EYE_DROPS', 'EAR_DROPS', 'NASAL_DROPS', 'INJECTIONS');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."ProductStatus" AS ENUM('ACTIVE', 'DRAFT', 'ARCHIVED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."SKULocation" AS ENUM('MANGALORE-01', 'MANGALORE-02', 'KERALA-01');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."UnitOfMeasure" AS ENUM('NONE', 'TABLETS', 'ML', 'GM(s)', 'DROPS', 'AMPOULES');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."UserRole" AS ENUM('ADMIN', 'USER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Account" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"userId" varchar(32) NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" varchar(32),
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Address" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"userId" varchar(32) NOT NULL,
	"street" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"postalCode" varchar(10) NOT NULL,
	"country" varchar(50) DEFAULT 'India' NOT NULL,
	"addressType" "AddressType" DEFAULT 'SHIPPING' NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Category" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"parentId" varchar(32)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "InventoryManagement" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"productVariantId" varchar(32) NOT NULL,
	"orderId" varchar(32),
	"type" "MovementType" NOT NULL,
	"quantity" integer NOT NULL,
	"reason" text NOT NULL,
	"location" "SKULocation" NOT NULL,
	"previousStock" integer NOT NULL,
	"newStock" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"createdBy" varchar(32) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Manufacturer" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Order" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"userId" varchar(32) NOT NULL,
	"orderDate" timestamp (3) DEFAULT now() NOT NULL,
	"subtotal" double precision NOT NULL,
	"shippingCost" double precision DEFAULT 0 NOT NULL,
	"discount" double precision DEFAULT 0 NOT NULL,
	"tax" double precision DEFAULT 0 NOT NULL,
	"totalAmountPaid" double precision NOT NULL,
	"orderType" "OrderType" DEFAULT 'ONLINE' NOT NULL,
	"deliveryStatus" "DeliveryStatus" DEFAULT 'PROCESSING' NOT NULL,
	"shippingAddressId" varchar(32) NOT NULL,
	"billingAddressId" varchar(32) NOT NULL,
	"paymentStatus" "PaymentStatus" DEFAULT 'PENDING' NOT NULL,
	"paymentIntentId" varchar(100),
	"invoiceNumber" varchar(50),
	"customerNotes" text,
	"adminNotes" text,
	"cancellationReason" text,
	"estimatedDeliveryDate" timestamp,
	"deliveredAt" timestamp,
	"paymentMethodId" varchar(32)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "OrderDetails" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"orderId" varchar(32) NOT NULL,
	"productVariantId" varchar(32) NOT NULL,
	"originalPrice" double precision NOT NULL,
	"discountAmount" double precision DEFAULT 0 NOT NULL,
	"taxAmount" double precision DEFAULT 0 NOT NULL,
	"unitPrice" double precision NOT NULL,
	"quantity" integer NOT NULL,
	"itemStatus" "DeliveryStatus" DEFAULT 'PROCESSING' NOT NULL,
	"returnReason" text,
	"returnedAt" timestamp,
	"refundAmount" double precision,
	"fulfilledFromLocation" "SKULocation"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PaymentMethod" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"userId" varchar(32) NOT NULL,
	"paymentType" "PaymentType" NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"paymentDetails" jsonb NOT NULL,
	"displayDetails" jsonb NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Product" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"form" "ProductForm" NOT NULL,
	"unit" "UnitOfMeasure" NOT NULL,
	"status" "ProductStatus" DEFAULT 'ACTIVE' NOT NULL,
	"tags" text[],
	"categoryId" varchar(32) NOT NULL,
	"manufacturerId" varchar(32) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProductVariant" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"productId" varchar(32) NOT NULL,
	"sku" varchar(50) NOT NULL,
	"variantName" text NOT NULL,
	"variantImage" text[] NOT NULL,
	"potency" varchar,
	"packSize" integer,
	"stockByLocation" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"costPrice" double precision NOT NULL,
	"sellingPrice" double precision NOT NULL,
	"discountedPrice" double precision,
	CONSTRAINT "ProductVariant_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Review" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"rating" double precision DEFAULT 0 NOT NULL,
	"comment" text,
	"userId" varchar(32) NOT NULL,
	"productId" varchar(32) NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Tags" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TwoFactorConfirmation" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"userId" varchar(32) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TwoFactorToken" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp (3),
	"image" text,
	"password" text,
	"role" "UserRole" DEFAULT 'USER' NOT NULL,
	"lastActive" timestamp (3) DEFAULT now() NOT NULL,
	"isTwoFactorEnabled" boolean DEFAULT false NOT NULL,
	"phone" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "VerificationToken" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp (3) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Category"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "InventoryManagement" ADD CONSTRAINT "InventoryManagement_productVariantId_ProductVariant_id_fk" FOREIGN KEY ("productVariantId") REFERENCES "public"."ProductVariant"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "InventoryManagement" ADD CONSTRAINT "InventoryManagement_orderId_Order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "InventoryManagement" ADD CONSTRAINT "InventoryManagement_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingAddress_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "public"."Address"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Order" ADD CONSTRAINT "Order_billingAddress_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "public"."Address"("id") ON DELETE restrict ON UPDATE cascade;
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
DO $$ BEGIN
 ALTER TABLE "OrderDetails" ADD CONSTRAINT "OrderDetails_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "OrderDetails" ADD CONSTRAINT "OrderDetails_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "public"."ProductVariant"("id") ON DELETE cascade ON UPDATE cascade;
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
DO $$ BEGIN
 ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Product" ADD CONSTRAINT "Product_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "public"."Manufacturer"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TwoFactorConfirmation" ADD CONSTRAINT "TwoFactorConfirmation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account" USING btree ("provider","providerAccountId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Adress_userId_index" ON "Address" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_movement_variant" ON "InventoryManagement" USING btree ("productVariantId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_movement_date" ON "InventoryManagement" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_movement_order" ON "InventoryManagement" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_movement_location" ON "InventoryManagement" USING btree ("location");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_date_status_idx" ON "Order" USING btree ("orderDate","deliveryStatus");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_user_date_idx" ON "Order" USING btree ("userId","orderDate");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_payment_status_idx" ON "Order" USING btree ("paymentStatus");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_invoice_number_idx" ON "Order" USING btree ("invoiceNumber");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_details_status_idx" ON "OrderDetails" USING btree ("itemStatus");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_details_fulfillment_idx" ON "OrderDetails" USING btree ("fulfilledFromLocation");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_email_token_key" ON "PasswordResetToken" USING btree ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_token_key" ON "PasswordResetToken" USING btree ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "PaymentMethod_userId_index" ON "PaymentMethod" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_name_idx" ON "Product" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_status_idx" ON "Product" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_category_idx" ON "Product" USING btree ("categoryId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_created_at_idx" ON "Product" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_form_unit_idx" ON "Product" USING btree ("unit","form");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_variant_sku" ON "ProductVariant" USING btree ("sku");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_variant_costPrice" ON "ProductVariant" USING btree ("costPrice");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_variant_sellingPrice" ON "ProductVariant" USING btree ("sellingPrice");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_variant_stock_location" ON "ProductVariant" USING btree ("stockByLocation");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_variant_search" ON "ProductVariant" USING btree ("productId","potency","packSize");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "TwoFactorConfirmation_userId_key" ON "TwoFactorConfirmation" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "TwoFactorToken_email_token_key" ON "TwoFactorToken" USING btree ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "TwoFactorToken_token_key" ON "TwoFactorToken" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_email_token_key" ON "VerificationToken" USING btree ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken" USING btree ("token");