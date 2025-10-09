CREATE TABLE "config" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(32) DEFAULT 'default' NOT NULL,
	"site_name" varchar(64) NOT NULL,
	"site_description" text NOT NULL,
	"public_site" boolean DEFAULT false,
	"default_role" integer DEFAULT 2,
	"default_theme" varchar(16) DEFAULT 'light' NOT NULL,
	"default_local_name" varchar(8) DEFAULT 'en' NOT NULL,
	"api_base_url" varchar(64) DEFAULT 'api/v1' NOT NULL,
	"application_api" varchar(128) DEFAULT 'http://127.0.0.1:5002/api/v1/' NOT NULL,
	"logos" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"avatar" varchar,
	"theme" varchar(16),
	"default_local_name" varchar(8) DEFAULT 'en-US' NOT NULL,
	"local_name" varchar(8) DEFAULT 'en' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar(150) NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"reset_password" boolean DEFAULT true NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"role" integer DEFAULT 5 NOT NULL,
	"avatar" varchar(150),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_config" ADD CONSTRAINT "user_config_user_id_user_uid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("uid") ON DELETE no action ON UPDATE no action;