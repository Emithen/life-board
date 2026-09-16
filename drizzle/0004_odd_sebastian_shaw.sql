CREATE TYPE "public"."tag_color" AS ENUM('gray', 'blue', 'green', 'amber', 'red', 'violet');--> statement-breakpoint
CREATE TABLE "document_tags" (
	"document_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"color" "tag_color" DEFAULT 'gray' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_length_check" CHECK (char_length("tags"."name") between 1 and 30)
);
--> statement-breakpoint
ALTER TABLE "document_tags" ADD CONSTRAINT "document_tags_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_tags" ADD CONSTRAINT "document_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "document_tags_document_tag_uq" ON "document_tags" USING btree ("document_id","tag_id");--> statement-breakpoint
CREATE INDEX "document_tags_tag_id_idx" ON "document_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_normalized_name_uq" ON "tags" USING btree ("normalized_name");