CREATE TABLE "app_documents" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_uid" uuid NOT NULL,
	"name" varchar(128) NOT NULL,
	"alt" varchar(64),
	"size" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"original_file" "bytea" NOT NULL,
	"lg_file" "bytea",
	"md_file" "bytea",
	"sm_file" "bytea",
	"type" varchar(128) NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registration_table" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar(150) NOT NULL,
	"verified" boolean DEFAULT true NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"otp" varchar(8) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"identifier" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_token" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar(8) NOT NULL,
	"valid" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emails" (
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
ALTER TABLE "user" ADD COLUMN "phone" varchar(25);--> statement-breakpoint
ALTER TABLE "app_documents" ADD CONSTRAINT "app_documents_owner_uid_user_uid_fk" FOREIGN KEY ("owner_uid") REFERENCES "public"."user"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "otp" ADD CONSTRAINT "otp_user_id_user_uid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("uid") ON DELETE no action ON UPDATE no action;