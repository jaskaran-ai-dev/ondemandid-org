ALTER TABLE "customers" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "ondemand_requests" ADD COLUMN "deleted_at" timestamp;