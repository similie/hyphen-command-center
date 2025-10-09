CREATE TABLE "email" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(128) NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"props" json DEFAULT '{}'::json,
	"sent" boolean DEFAULT false NOT NULL,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "emails" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "emails" CASCADE;--> statement-breakpoint
ALTER TABLE "verification_token" ADD CONSTRAINT "verification_token_valid_unique" UNIQUE("valid");