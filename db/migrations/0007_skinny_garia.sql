ALTER TABLE "api_keys" ADD COLUMN "last_used_at" timestamp;--> statement-breakpoint
ALTER TABLE "api_keys" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "api_keys" ADD COLUMN "expires_at" timestamp;