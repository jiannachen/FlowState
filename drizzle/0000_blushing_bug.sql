CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"title" text NOT NULL,
	"category" text DEFAULT 'General',
	"blocks" jsonb DEFAULT '[]'::jsonb,
	"last_modified" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"goal" text NOT NULL,
	"tasks" jsonb NOT NULL,
	"energy_distribution" jsonb NOT NULL,
	"journal_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" text DEFAULT 'Uncategorized',
	"usage_count" integer DEFAULT 0,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"strengths_raw_text" text,
	"top_strengths" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;