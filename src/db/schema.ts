import {
  check,
  date,
  integer,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import {
  DOCUMENT_CONTENT_MAX_LENGTH,
  DOCUMENT_TITLE_MAX_LENGTH,
  TOPIC_DESCRIPTION_MAX_LENGTH,
  TOPIC_NAME_MAX_LENGTH,
} from "@/features/content/model";
import {
  TODO_NOTES_MAX_LENGTH,
  TODO_TITLE_MAX_LENGTH,
} from "@/features/todos/model";

export const todoStatus = pgEnum("todo_status", [
  "active",
  "completed",
  "archived",
]);

export const todos = pgTable(
  "todos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    notes: text("notes"),
    status: todoStatus("status").notNull().default("active"),
    priority: integer("priority").notNull().default(2),
    dueDate: date("due_date"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "todos_title_length_check",
      sql`char_length(${table.title}) between 1 and ${sql.raw(String(TODO_TITLE_MAX_LENGTH))}`,
    ),
    check(
      "todos_notes_length_check",
      sql`${table.notes} is null or char_length(${table.notes}) <= ${sql.raw(String(TODO_NOTES_MAX_LENGTH))}`,
    ),
    check(
      "todos_priority_check",
      sql`${table.priority} between 1 and 3`,
    ),
  ],
);

export type Todo = typeof todos.$inferSelect;

export const topics = pgTable(
  "topics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color").notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "topics_name_length_check",
      sql`char_length(${table.name}) between 1 and ${sql.raw(String(TOPIC_NAME_MAX_LENGTH))}`,
    ),
    check(
      "topics_description_length_check",
      sql`${table.description} is null or char_length(${table.description}) <= ${sql.raw(String(TOPIC_DESCRIPTION_MAX_LENGTH))}`,
    ),
    check("topics_color_format_check", sql`${table.color} ~ '^#[0-9a-fA-F]{6}$'`),
    index("topics_archived_at_idx").on(table.archivedAt),
  ],
);

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    topicId: uuid("topic_id")
      .references(() => topics.id),
    parentId: uuid("parent_id").references((): AnyPgColumn => documents.id),
    legacyTopicId: uuid("legacy_topic_id").references(() => topics.id),
    title: text("title").notNull(),
    content: text("content"),
    accentColor: text("accent_color"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "documents_title_length_check",
      sql`char_length(${table.title}) between 1 and ${sql.raw(String(DOCUMENT_TITLE_MAX_LENGTH))}`,
    ),
    check(
      "documents_content_length_check",
      sql`${table.content} is null or char_length(${table.content}) <= ${sql.raw(String(DOCUMENT_CONTENT_MAX_LENGTH))}`,
    ),
    check("documents_parent_not_self_check", sql`${table.parentId} is null or ${table.parentId} <> ${table.id}`),
    check("documents_accent_color_format_check", sql`${table.accentColor} is null or ${table.accentColor} ~ '^#[0-9a-fA-F]{6}$'`),
    index("documents_topic_id_idx").on(table.topicId),
    index("documents_parent_id_idx").on(table.parentId),
    index("documents_archived_at_idx").on(table.archivedAt),
    uniqueIndex("documents_legacy_topic_id_uq").on(table.legacyTopicId),
  ],
);

export const documentReferences = pgTable(
  "document_references",
  {
    sourceDocumentId: uuid("source_document_id")
      .notNull()
      .references(() => documents.id),
    targetDocumentId: uuid("target_document_id")
      .notNull()
      .references(() => documents.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("document_references_source_target_uq").on(
      table.sourceDocumentId,
      table.targetDocumentId,
    ),
    index("document_references_target_id_idx").on(table.targetDocumentId),
    check(
      "document_references_not_self_check",
      sql`${table.sourceDocumentId} <> ${table.targetDocumentId}`,
    ),
  ],
);

export type Topic = typeof topics.$inferSelect;
export type Document = typeof documents.$inferSelect;
