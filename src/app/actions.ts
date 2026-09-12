"use server";

import { revalidatePath } from "next/cache";
import { isDatabaseConfigured } from "@/db";
import type { TodoActionState } from "@/features/todos/model";
import {
  archiveTodoById,
  insertTodo,
  restoreTodoById,
  transitionTodo,
  updateTodoDetails,
} from "@/features/todos/repository";
import {
  isValidTodoId,
  parseTodoInput,
} from "@/features/todos/validation";

export type { TodoActionState } from "@/features/todos/model";

type MutationMessages = {
  success: string;
  notFound: string;
  failure: string;
};

function errorState(message: string): TodoActionState {
  return { status: "error", message };
}

function databaseErrorState() {
  return errorState("데이터베이스 연결을 먼저 설정해 주세요.");
}

async function runMutation({
  mutate,
  messages,
  paths,
}: {
  mutate: () => Promise<boolean>;
  messages: MutationMessages;
  paths: string[];
}): Promise<TodoActionState> {
  if (!isDatabaseConfigured()) {
    return databaseErrorState();
  }

  try {
    if (!(await mutate())) {
      return errorState(messages.notFound);
    }

    for (const path of paths) {
      revalidatePath(path);
    }

    return { status: "success", message: messages.success };
  } catch (error) {
    console.error("Todo mutation failed", error);
    return errorState(messages.failure);
  }
}

export async function createTodo(
  _previousState: TodoActionState,
  formData: FormData,
): Promise<TodoActionState> {
  const parsed = parseTodoInput(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "입력 내용을 확인해 주세요.",
      fieldErrors: parsed.fieldErrors,
    };
  }

  if (!isDatabaseConfigured()) {
    return databaseErrorState();
  }

  try {
    await insertTodo(parsed.data);
    revalidatePath("/");
    return { status: "success", message: "Todo를 추가했습니다." };
  } catch (error) {
    console.error("Todo creation failed", error);
    return errorState("Todo를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

export async function updateTodo(
  id: string,
  _previousState: TodoActionState,
  formData: FormData,
): Promise<TodoActionState> {
  if (!isValidTodoId(id)) {
    return errorState("올바르지 않은 Todo 요청입니다.");
  }

  const parsed = parseTodoInput(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "입력 내용을 확인해 주세요.",
      fieldErrors: parsed.fieldErrors,
    };
  }

  return runMutation({
    mutate: () => updateTodoDetails(id, parsed.data),
    messages: {
      success: "Todo를 수정했습니다.",
      notFound: "수정할 수 있는 Todo를 찾을 수 없습니다.",
      failure: "Todo를 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    },
    paths: ["/"],
  });
}

export async function toggleTodo(
  id: string,
  nextStatus: "active" | "completed",
  _previousState: TodoActionState,
  _formData: FormData,
): Promise<TodoActionState> {
  void _previousState;
  void _formData;

  if (!isValidTodoId(id) || !["active", "completed"].includes(nextStatus)) {
    return errorState("올바르지 않은 Todo 요청입니다.");
  }

  const transition =
    nextStatus === "completed"
      ? ({ from: "active", to: "completed" } as const)
      : ({ from: "completed", to: "active" } as const);

  return runMutation({
    mutate: () => transitionTodo(id, transition),
    messages: {
      success: "Todo 상태를 변경했습니다.",
      notFound: "상태를 변경할 수 있는 Todo를 찾을 수 없습니다.",
      failure: "상태를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    },
    paths: ["/"],
  });
}

export async function archiveTodo(
  id: string,
  _previousState: TodoActionState,
  _formData: FormData,
): Promise<TodoActionState> {
  void _previousState;
  void _formData;

  if (!isValidTodoId(id)) {
    return errorState("올바르지 않은 Todo 요청입니다.");
  }

  return runMutation({
    mutate: () => archiveTodoById(id),
    messages: {
      success: "Todo를 보관했습니다.",
      notFound: "보관할 수 있는 Todo를 찾을 수 없습니다.",
      failure: "Todo를 보관하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    },
    paths: ["/", "/archive"],
  });
}

export async function restoreTodo(
  id: string,
  _previousState: TodoActionState,
  _formData: FormData,
): Promise<TodoActionState> {
  void _previousState;
  void _formData;

  if (!isValidTodoId(id)) {
    return errorState("올바르지 않은 Todo 요청입니다.");
  }

  return runMutation({
    mutate: () => restoreTodoById(id),
    messages: {
      success: "Todo를 복원했습니다.",
      notFound: "복원할 수 있는 Todo를 찾을 수 없습니다.",
      failure: "Todo를 복원하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    },
    paths: ["/", "/archive"],
  });
}
