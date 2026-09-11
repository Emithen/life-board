"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, isDatabaseConfigured } from "@/db";
import { todos } from "@/db/schema";

export type TodoActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<
    Record<"title" | "notes" | "dueDate" | "priority", string>
  >;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function errorState(message: string): TodoActionState {
  return { status: "error", message };
}

function getString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function parseTodoInput(formData: FormData) {
  const title = getString(formData, "title");
  const notes = getString(formData, "notes");
  const dueDate = getString(formData, "dueDate");
  const priorityValue = getString(formData, "priority");
  const fieldErrors: TodoActionState["fieldErrors"] = {};

  if (!title) {
    fieldErrors.title = "할 일을 입력해 주세요.";
  } else if (title.length > 120) {
    fieldErrors.title = "할 일은 120자 이하로 입력해 주세요.";
  }

  if (notes.length > 2000) {
    fieldErrors.notes = "메모는 2,000자 이하로 입력해 주세요.";
  }

  if (dueDate && !isValidDate(dueDate)) {
    fieldErrors.dueDate = "올바른 날짜를 입력해 주세요.";
  }

  if (!["1", "2", "3"].includes(priorityValue)) {
    fieldErrors.priority = "올바른 우선순위를 선택해 주세요.";
  }

  return {
    title,
    notes,
    dueDate,
    priority: Number(priorityValue),
    fieldErrors,
  };
}

export async function createTodo(
  _previousState: TodoActionState,
  formData: FormData,
): Promise<TodoActionState> {
  const { title, notes, dueDate, priority, fieldErrors } =
    parseTodoInput(formData);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "입력 내용을 확인해 주세요.",
      fieldErrors,
    };
  }

  if (!isDatabaseConfigured()) {
    return errorState("데이터베이스 연결을 먼저 설정해 주세요.");
  }

  try {
    await db().insert(todos).values({
      title,
      notes: notes || null,
      dueDate: dueDate || null,
      priority,
    });

    revalidatePath("/");
    return { status: "success", message: "Todo를 추가했습니다." };
  } catch {
    return errorState("Todo를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

export async function updateTodo(
  id: string,
  _previousState: TodoActionState,
  formData: FormData,
): Promise<TodoActionState> {
  void _previousState;

  if (!uuidPattern.test(id)) {
    return errorState("올바르지 않은 Todo 요청입니다.");
  }

  const { title, notes, dueDate, priority, fieldErrors } =
    parseTodoInput(formData);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "입력 내용을 확인해 주세요.",
      fieldErrors,
    };
  }

  if (!isDatabaseConfigured()) {
    return errorState("데이터베이스 연결을 먼저 설정해 주세요.");
  }

  try {
    const updated = await db()
      .update(todos)
      .set({
        title,
        notes: notes || null,
        dueDate: dueDate || null,
        priority,
        updatedAt: new Date(),
      })
      .where(eq(todos.id, id))
      .returning({ id: todos.id });

    if (updated.length === 0) {
      return errorState("Todo를 찾을 수 없습니다.");
    }

    revalidatePath("/");
    return { status: "success", message: "Todo를 수정했습니다." };
  } catch {
    return errorState("Todo를 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

export async function toggleTodo(
  id: string,
  nextStatus: "active" | "completed",
  _previousState: TodoActionState,
  _formData: FormData,
): Promise<TodoActionState> {
  void _previousState;
  void _formData;

  if (!uuidPattern.test(id) || !["active", "completed"].includes(nextStatus)) {
    return errorState("올바르지 않은 Todo 요청입니다.");
  }

  if (!isDatabaseConfigured()) {
    return errorState("데이터베이스 연결을 먼저 설정해 주세요.");
  }

  try {
    const updated = await db()
      .update(todos)
      .set({
        status: nextStatus,
        completedAt: nextStatus === "completed" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(todos.id, id))
      .returning({ id: todos.id });

    if (updated.length === 0) {
      return errorState("Todo를 찾을 수 없습니다.");
    }

    revalidatePath("/");
    return { status: "success", message: "Todo 상태를 변경했습니다." };
  } catch {
    return errorState("상태를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

export async function archiveTodo(
  id: string,
  _previousState: TodoActionState,
  _formData: FormData,
): Promise<TodoActionState> {
  void _previousState;
  void _formData;

  if (!uuidPattern.test(id)) {
    return errorState("올바르지 않은 Todo 요청입니다.");
  }

  if (!isDatabaseConfigured()) {
    return errorState("데이터베이스 연결을 먼저 설정해 주세요.");
  }

  try {
    const archived = await db()
      .update(todos)
      .set({ status: "archived", updatedAt: new Date() })
      .where(eq(todos.id, id))
      .returning({ id: todos.id });

    if (archived.length === 0) {
      return errorState("Todo를 찾을 수 없습니다.");
    }

    revalidatePath("/");
    revalidatePath("/archive");
    return { status: "success", message: "Todo를 보관했습니다." };
  } catch {
    return errorState("Todo를 보관하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

export async function restoreTodo(
  id: string,
  _previousState: TodoActionState,
  _formData: FormData,
): Promise<TodoActionState> {
  void _previousState;
  void _formData;

  if (!uuidPattern.test(id)) {
    return errorState("올바르지 않은 Todo 요청입니다.");
  }

  if (!isDatabaseConfigured()) {
    return errorState("데이터베이스 연결을 먼저 설정해 주세요.");
  }

  try {
    const restored = await db()
      .update(todos)
      .set({ status: "active", completedAt: null, updatedAt: new Date() })
      .where(eq(todos.id, id))
      .returning({ id: todos.id });

    if (restored.length === 0) {
      return errorState("Todo를 찾을 수 없습니다.");
    }

    revalidatePath("/");
    revalidatePath("/archive");
    return { status: "success", message: "Todo를 복원했습니다." };
  } catch {
    return errorState("Todo를 복원하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
}
