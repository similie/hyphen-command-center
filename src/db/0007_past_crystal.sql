ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 2;--> statement-breakpoint
ALTER TABLE "email" ADD COLUMN "email_sent" timestamp DEFAULT now() NOT NULL;