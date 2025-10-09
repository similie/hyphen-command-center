ALTER TABLE "app_documents" DROP CONSTRAINT "app_documents_owner_uid_user_uid_fk";
--> statement-breakpoint
ALTER TABLE "app_documents" ALTER COLUMN "owner_uid" DROP NOT NULL;