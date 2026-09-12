import {
  TODO_NOTES_MAX_LENGTH,
  TODO_TITLE_MAX_LENGTH,
  isTodoPriority,
  type TodoFieldErrors,
  type TodoPriority,
} from "./model";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type TodoInput = {
  title: string;
  notes: string | null;
  dueDate: string | null;
  priority: TodoPriority;
};

export type TodoInputResult =
  | { success: true; data: TodoInput }
  | { success: false; fieldErrors: TodoFieldErrors };

function getString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isValidTodoId(id: string) {
  return uuidPattern.test(id);
}

export function parseTodoInput(formData: FormData): TodoInputResult {
  const title = getString(formData, "title");
  const notes = getString(formData, "notes");
  const dueDate = getString(formData, "dueDate");
  const priority = Number(getString(formData, "priority"));
  const fieldErrors: TodoFieldErrors = {};

  if (!title) {
    fieldErrors.title = "할 일을 입력해 주세요.";
  } else if (title.length > TODO_TITLE_MAX_LENGTH) {
    fieldErrors.title = `할 일은 ${TODO_TITLE_MAX_LENGTH}자 이하로 입력해 주세요.`;
  }

  if (notes.length > TODO_NOTES_MAX_LENGTH) {
    fieldErrors.notes = "메모는 2,000자 이하로 입력해 주세요.";
  }

  if (dueDate && !isValidDate(dueDate)) {
    fieldErrors.dueDate = "올바른 날짜를 입력해 주세요.";
  }

  if (!isTodoPriority(priority)) {
    fieldErrors.priority = "올바른 우선순위를 선택해 주세요.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      title,
      notes: notes || null,
      dueDate: dueDate || null,
      priority: priority as TodoPriority,
    },
  };
}
