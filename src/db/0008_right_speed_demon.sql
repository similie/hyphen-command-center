ALTER TABLE "registration" ADD COLUMN "email_sent" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "email" DROP COLUMN "email_sent";