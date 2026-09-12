export const TODO_TITLE_MAX_LENGTH = 120;
export const TODO_NOTES_MAX_LENGTH = 2_000;

export const TODO_PRIORITIES = [
  { value: 1, label: "High" },
  { value: 2, label: "Normal" },
  { value: 3, label: "Low" },
] as const;

export type TodoPriority = (typeof TODO_PRIORITIES)[number]["value"];
export type TodoStatus = "active" | "completed" | "archived";

export type TodoFieldName = "title" | "notes" | "dueDate" | "priority";
export type TodoFieldErrors = Partial<Record<TodoFieldName, string>>;

export type TodoActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: TodoFieldErrors;
};

export type EditableTodo = {
  id: string;
  title: string;
  notes: string | null;
  dueDate: string | null;
  priority: number;
};

export function isTodoPriority(value: number): value is TodoPriority {
  return TODO_PRIORITIES.some((priority) => priority.value === value);
}

export function priorityLabel(priority: number) {
  return (
    TODO_PRIORITIES.find((option) => option.value === priority)?.label ??
    "Unknown"
  );
}
