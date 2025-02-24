ALTER TABLE "users" RENAME COLUMN "email_verified" TO "email_confirmed";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "email_verification_code" TO "email_confirmation_code";