CREATE TABLE "document_references" (
	"source_document_id" uuid NOT NULL,
	"target_document_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "document_references_not_self_check" CHECK ("document_references"."source_document_id" <> "document_references"."target_document_id")
);
--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "topic_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "parent_id" uuid;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "legacy_topic_id" uuid;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "accent_color" text;--> statement-breakpoint
ALTER TABLE "document_references" ADD CONSTRAINT "document_references_source_document_id_documents_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_references" ADD CONSTRAINT "document_references_target_document_id_documents_id_fk" FOREIGN KEY ("target_document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "document_references_source_target_uq" ON "document_references" USING btree ("source_document_id","target_document_id");--> statement-breakpoint
CREATE INDEX "document_references_target_id_idx" ON "document_references" USING btree ("target_document_id");--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_parent_id_documents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_legacy_topic_id_topics_id_fk" FOREIGN KEY ("legacy_topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "documents_parent_id_idx" ON "documents" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "documents_legacy_topic_id_uq" ON "documents" USING btree ("legacy_topic_id");--> statement-breakpoint
INSERT INTO "documents" (
	"legacy_topic_id", "title", "content", "accent_color", "archived_at", "created_at", "updated_at"
)
SELECT "id", "name", "description", "color", "archived_at", "created_at", "updated_at"
FROM "topics";--> statement-breakpoint
UPDATE "documents" AS child
SET "parent_id" = root."id"
FROM "documents" AS root
WHERE child."topic_id" = root."legacy_topic_id";--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM "topics" AS topic
		LEFT JOIN "documents" AS root ON root."legacy_topic_id" = topic."id"
		WHERE root."id" IS NULL
	) THEN
		RAISE EXCEPTION 'Document migration left a topic without a root document';
	END IF;
	IF EXISTS (
		SELECT 1 FROM "documents" AS child
		LEFT JOIN "documents" AS root ON root."id" = child."parent_id"
		WHERE child."topic_id" IS NOT NULL
			AND (root."id" IS NULL OR root."legacy_topic_id" IS DISTINCT FROM child."topic_id")
	) THEN
		RAISE EXCEPTION 'Document migration left a legacy document under the wrong root';
	END IF;
END $$;--> statement-breakpoint
CREATE FUNCTION "sync_legacy_topic_root"() RETURNS trigger AS $$
BEGIN
	IF TG_OP = 'INSERT' THEN
		INSERT INTO "documents" (
			"legacy_topic_id", "title", "content", "accent_color", "archived_at", "created_at", "updated_at"
		) VALUES (
			NEW."id", NEW."name", NEW."description", NEW."color", NEW."archived_at", NEW."created_at", NEW."updated_at"
		);
	ELSE
		UPDATE "documents"
		SET "title" = NEW."name",
			"content" = NEW."description",
			"accent_color" = NEW."color",
			"archived_at" = NEW."archived_at",
			"updated_at" = NEW."updated_at"
		WHERE "legacy_topic_id" = NEW."id";
		IF NOT FOUND THEN
			RAISE EXCEPTION 'Root document missing for legacy topic %', NEW."id";
		END IF;
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER "sync_legacy_topic_root_trigger"
AFTER INSERT OR UPDATE OF "name", "description", "color", "archived_at", "updated_at" ON "topics"
FOR EACH ROW EXECUTE FUNCTION "sync_legacy_topic_root"();--> statement-breakpoint
CREATE FUNCTION "attach_legacy_document_to_root"() RETURNS trigger AS $$
BEGIN
	IF NEW."topic_id" IS NOT NULL AND NEW."parent_id" IS NULL THEN
		SELECT "id" INTO NEW."parent_id"
		FROM "documents"
		WHERE "legacy_topic_id" = NEW."topic_id";
		IF NEW."parent_id" IS NULL THEN
			RAISE EXCEPTION 'Root document missing for legacy topic %', NEW."topic_id";
		END IF;
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER "attach_legacy_document_to_root_trigger"
BEFORE INSERT ON "documents"
FOR EACH ROW EXECUTE FUNCTION "attach_legacy_document_to_root"();--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_parent_not_self_check" CHECK ("documents"."parent_id" is null or "documents"."parent_id" <> "documents"."id");--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_accent_color_format_check" CHECK ("documents"."accent_color" is null or "documents"."accent_color" ~ '^#[0-9a-fA-F]{6}$');
