"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, isDatabaseConfigured } from "@/db";
import { todos } from "@/db/schema";

function requireDatabase() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is required to change todos.");
  }
}

export async function createTodo(formData: FormData) {
  requireDatabase();

  const title = String(formData.get("title") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const priority = Number(formData.get("priority") ?? 2);

  if (!title) {
    return;
  }

  await db().insert(todos).values({
    title,
    notes: notes || null,
    dueDate: dueDate || null,
    priority: Number.isFinite(priority) ? priority : 2,
  });

  revalidatePath("/");
}

export async function toggleTodo(id: string, nextStatus: "active" | "completed") {
  requireDatabase();

  await db()
    .update(todos)
    .set({
      status: nextStatus,
      completedAt: nextStatus === "completed" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(todos.id, id));

  revalidatePath("/");
}

export async function archiveTodo(id: string) {
  requireDatabase();

  await db()
    .update(todos)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(todos.id, id));

  revalidatePath("/");
}
