CREATE TABLE "site_routing" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_name" varchar NOT NULL,
	"path" varchar(150) NOT NULL,
	"public" boolean DEFAULT false NOT NULL,
	"config_id" uuid NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"role" integer DEFAULT 2 NOT NULL,
	"params" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "verification_token" DROP CONSTRAINT "verification_token_valid_unique";--> statement-breakpoint
ALTER TABLE "verification_token" ALTER COLUMN "token" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "verification_token" ADD COLUMN "context" varchar(48) DEFAULT 'auth';--> statement-breakpoint
ALTER TABLE "site_routing" ADD CONSTRAINT "site_routing_config_id_config_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."config"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_token" ADD CONSTRAINT "verification_token_token_unique" UNIQUE("token");