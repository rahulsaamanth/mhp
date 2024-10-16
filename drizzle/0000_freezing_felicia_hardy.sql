DO $$ BEGIN
 CREATE TYPE "public"."OrderType" AS ENUM('OFFLINE', 'ONLINE');
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
CREATE TABLE IF NOT EXISTS "Category" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"parentId" varchar(32)
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
	"orderDate" timestamp (3) NOT NULL,
	"orderType" "OrderType" DEFAULT 'ONLINE' NOT NULL,
	"totalAmountPaid" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "OrderDetails" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"orderId" varchar(32) NOT NULL,
	"productVariantId" varchar(32) NOT NULL,
	"quantity" integer NOT NULL,
	"unitPrice" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Product" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"image" text[] NOT NULL,
	"tags" text[],
	"categoryId" varchar(32) NOT NULL,
	"manufacturerId" varchar(32) NOT NULL,
	"properties" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProductVariant" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"productId" varchar(32) NOT NULL,
	"variantName" text NOT NULL,
	"potency" varchar,
	"packSize" varchar,
	"price" double precision NOT NULL,
	"stock" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Review" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"rating" double precision DEFAULT 0 NOT NULL,
	"comment" text,
	"userId" varchar(32) NOT NULL,
	"productId" varchar(32) NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
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
	"lastActive" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"isTwoFactorEnabled" boolean DEFAULT false NOT NULL,
	"phone" text,
	"shippingAddress" text,
	"billingAddress" text,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
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
 ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Category"("id") ON DELETE set null ON UPDATE cascade;
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
 ALTER TABLE "OrderDetails" ADD CONSTRAINT "OrderDetails_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "OrderDetails" ADD CONSTRAINT "OrderDetails_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "public"."ProductVariant"("id") ON DELETE restrict ON UPDATE cascade;
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
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_email_token_key" ON "PasswordResetToken" USING btree ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_token_key" ON "PasswordResetToken" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "TwoFactorConfirmation_userId_key" ON "TwoFactorConfirmation" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "TwoFactorToken_email_token_key" ON "TwoFactorToken" USING btree ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "TwoFactorToken_token_key" ON "TwoFactorToken" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_email_token_key" ON "VerificationToken" USING btree ("email","token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken" USING btree ("token");