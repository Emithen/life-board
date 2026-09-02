CREATE TYPE "public"."todo_status" AS ENUM('active', 'completed', 'archived');--> statement-breakpoint
CREATE TABLE "todos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"notes" text,
	"status" "todo_status" DEFAULT 'active' NOT NULL,
	"priority" integer DEFAULT 2 NOT NULL,
	"due_date" date,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
