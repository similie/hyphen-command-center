ALTER TABLE "api_access_log" DROP CONSTRAINT "api_access_log_api_key_api_key_key_fk";
--> statement-breakpoint
ALTER TABLE "api_key" DROP CONSTRAINT "api_key_config_id_user_uid_fk";
--> statement-breakpoint
ALTER TABLE "api_key" ADD COLUMN "owner" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "api_access_log" ADD CONSTRAINT "api_access_log_api_key_api_key_uid_fk" FOREIGN KEY ("api_key") REFERENCES "public"."api_key"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_owner_user_uid_fk" FOREIGN KEY ("owner") REFERENCES "public"."user"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_key" DROP COLUMN "config_id";