import {
  check,
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
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
