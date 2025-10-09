CREATE TABLE "internalroute" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_name" varchar NOT NULL,
	"scope" varchar DEFAULT 'internal' NOT NULL,
	"service" varchar DEFAULT 'application' NOT NULL,
	"service_url" varchar NOT NULL,
	"service_route" varchar NOT NULL,
	"port" integer DEFAULT 80 NOT NULL,
	"paths" json DEFAULT '[]'::json,
	"version" integer DEFAULT 1 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"production" boolean DEFAULT false NOT NULL,
	"api" boolean DEFAULT true NOT NULL,
	"api_version" integer DEFAULT 1 NOT NULL,
	"hash" varchar NOT NULL,
	"bindings" json DEFAULT '{}'::json,
	"subdomain" varchar DEFAULT '' NOT NULL,
	"fallback_path" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_access_log" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user" uuid NOT NULL,
	"api_key" uuid NOT NULL,
	"ip_address" varchar DEFAULT '' NOT NULL,
	"domain" varchar DEFAULT '' NOT NULL,
	"path" varchar DEFAULT '' NOT NULL,
	"method" varchar DEFAULT '' NOT NULL,
	"status" integer DEFAULT 200 NOT NULL,
	"response_time" integer DEFAULT 1000 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restricted_domains" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain" varchar NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"api_key" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "restricted_domains_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "api_key" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"plan" uuid NOT NULL,
	"config_id" integer NOT NULL,
	"description" text,
	"meta" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "api_key_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "api_plan" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar NOT NULL,
	"image" varchar DEFAULT '' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"grand_fathered" timestamp,
	"restriction" uuid NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "api_plan_name_unique" UNIQUE("name"),
	CONSTRAINT "api_plan_description_unique" UNIQUE("description")
);
--> statement-breakpoint
CREATE TABLE "plan_restriction" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"white_listed_paths" json DEFAULT '[]'::json,
	"monthly_access" integer DEFAULT 0 NOT NULL,
	"callback_count" integer DEFAULT 0 NOT NULL,
	"mcp_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plan_restriction_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "api_access_log" ADD CONSTRAINT "api_access_log_user_user_uid_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_access_log" ADD CONSTRAINT "api_access_log_api_key_api_key_key_fk" FOREIGN KEY ("api_key") REFERENCES "public"."api_key"("key") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restricted_domains" ADD CONSTRAINT "restricted_domains_api_key_api_key_uid_fk" FOREIGN KEY ("api_key") REFERENCES "public"."api_key"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_plan_api_plan_uid_fk" FOREIGN KEY ("plan") REFERENCES "public"."api_plan"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_config_id_user_uid_fk" FOREIGN KEY ("config_id") REFERENCES "public"."user"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_plan" ADD CONSTRAINT "api_plan_restriction_plan_restriction_uid_fk" FOREIGN KEY ("restriction") REFERENCES "public"."plan_restriction"("uid") ON DELETE no action ON UPDATE no action;