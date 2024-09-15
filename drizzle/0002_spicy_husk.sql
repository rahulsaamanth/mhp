DROP TABLE "PasswordResetToken";--> statement-breakpoint
DROP TABLE "_prisma_migrations";--> statement-breakpoint
DROP TABLE "TwoFactorToken";--> statement-breakpoint
DROP TABLE "VerificationToken";--> statement-breakpoint
DROP INDEX IF EXISTS "User_email_key";--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_email_unique" UNIQUE("email");