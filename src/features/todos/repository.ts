import "server-only";

import { and, asc, desc, eq, ne } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import { todos, type Todo } from "@/db/schema";
import type { TodoInput } from "./validation";

export type TodoListResult = {
  configured: boolean;
  items: Todo[];
};

export async function listCurrentTodos(): Promise<TodoListResult> {
  if (!isDatabaseConfigured()) {
    return { configured: false, items: [] };
  }

  const items = await db()
    .select()
    .from(todos)
    .where(ne(todos.status, "archived"))
    .orderBy(asc(todos.status), asc(todos.dueDate), desc(todos.createdAt));

  return { configured: true, items };
}

export async function listArchivedTodos(): Promise<TodoListResult> {
  if (!isDatabaseConfigured()) {
    return { configured: false, items: [] };
  }

  const items = await db()
    .select()
    .from(todos)
    .where(eq(todos.status, "archived"))
    .orderBy(desc(todos.updatedAt));

  return { configured: true, items };
}

export async function insertTodo(input: TodoInput) {
  await db().insert(todos).values(input);
}

export async function updateTodoDetails(id: string, input: TodoInput) {
  const updated = await db()
    .update(todos)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(todos.id, id), ne(todos.status, "archived")))
    .returning({ id: todos.id });

  return updated.length > 0;
}

export async function transitionTodo(
  id: string,
  transition:
    | { from: "active"; to: "completed" }
    | { from: "completed"; to: "active" },
) {
  const updated = await db()
    .update(todos)
    .set({
      status: transition.to,
      completedAt: transition.to === "completed" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(todos.id, id), eq(todos.status, transition.from)))
    .returning({ id: todos.id });

  return updated.length > 0;
}

export async function archiveTodoById(id: string) {
  const archived = await db()
    .update(todos)
    .set({ status: "archived", updatedAt: new Date() })
    .where(and(eq(todos.id, id), ne(todos.status, "archived")))
    .returning({ id: todos.id });

  return archived.length > 0;
}

export async function restoreTodoById(id: string) {
  const restored = await db()
    .update(todos)
    .set({ status: "active", completedAt: null, updatedAt: new Date() })
    .where(and(eq(todos.id, id), eq(todos.status, "archived")))
    .returning({ id: todos.id });

  return restored.length > 0;
}
