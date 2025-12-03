CREATE TABLE "strengths_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"strengths_raw_text" text NOT NULL,
	"top_strengths" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "strengths_configs" ADD CONSTRAINT "strengths_configs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "strengths_raw_text";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "top_strengths";