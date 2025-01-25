ALTER TABLE "questions" ADD COLUMN "images" text;--> statement-breakpoint
ALTER TABLE "answers" ADD COLUMN "images" text;--> statement-breakpoint
ALTER TABLE "answers" ADD COLUMN "accepted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "answers" DROP COLUMN "is_accepted";