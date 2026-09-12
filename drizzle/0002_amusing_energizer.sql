CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "documents_title_length_check" CHECK (char_length("documents"."title") between 1 and 120),
	CONSTRAINT "documents_content_length_check" CHECK ("documents"."content" is null or char_length("documents"."content") <= 10000)
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "topics_name_length_check" CHECK (char_length("topics"."name") between 1 and 60),
	CONSTRAINT "topics_description_length_check" CHECK ("topics"."description" is null or char_length("topics"."description") <= 240),
	CONSTRAINT "topics_color_format_check" CHECK ("topics"."color" ~ '^#[0-9a-fA-F]{6}$')
);
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "documents_topic_id_idx" ON "documents" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "documents_archived_at_idx" ON "documents" USING btree ("archived_at");--> statement-breakpoint
CREATE INDEX "topics_archived_at_idx" ON "topics" USING btree ("archived_at");