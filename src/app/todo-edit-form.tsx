"use client";

import { useActionState, useState } from "react";
import { LoaderCircle, Pencil, X } from "lucide-react";
import { updateTodo, type TodoActionState } from "./actions";

type EditableTodo = {
  id: string;
  title: string;
  notes: string | null;
  dueDate: string | null;
  priority: number;
};

const initialState: TodoActionState = {
  status: "idle",
  message: "",
};

export function TodoEditForm({ todo }: { todo: EditableTodo }) {
  const [editing, setEditing] = useState(false);
  const updateAction = updateTodo.bind(null, todo.id);
  const [state, formAction, pending] = useActionState(
    updateAction,
    initialState,
  );

  if (!editing) {
    return (
      <div className="flex items-center justify-end gap-3 sm:col-span-2">
        {state.status === "success" ? (
          <p aria-live="polite" className="text-xs text-emerald-700">
            {state.message}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex h-8 items-center gap-1.5 border border-neutral-200 px-2.5 text-xs text-neutral-600 hover:text-neutral-950"
        >
          <Pencil size={13} aria-hidden="true" />
          수정
        </button>
      </div>
    );
  }

  const fieldId = (name: string) => `${name}-${todo.id}`;

  return (
    <form
      action={formAction}
      aria-busy={pending}
      className="grid gap-4 border-t border-neutral-100 pt-4 sm:col-span-2 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <label htmlFor={fieldId("edit-title")} className="text-sm font-medium">
          할 일
        </label>
        <input
          id={fieldId("edit-title")}
          name="title"
          required
          maxLength={120}
          defaultValue={todo.title}
          aria-invalid={Boolean(state.fieldErrors?.title)}
          className="mt-2 h-10 w-full border border-neutral-300 px-3 text-sm outline-none focus:border-emerald-700 aria-invalid:border-red-500"
        />
        {state.fieldErrors?.title ? (
          <p className="mt-1 text-xs text-red-700">{state.fieldErrors.title}</p>
        ) : null}
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={fieldId("edit-notes")} className="text-sm font-medium">
          메모
        </label>
        <textarea
          id={fieldId("edit-notes")}
          name="notes"
          rows={3}
          maxLength={2000}
          defaultValue={todo.notes ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.notes)}
          className="mt-2 w-full resize-none border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 aria-invalid:border-red-500"
        />
        {state.fieldErrors?.notes ? (
          <p className="mt-1 text-xs text-red-700">{state.fieldErrors.notes}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor={fieldId("edit-due-date")} className="text-sm font-medium">
          마감일
        </label>
        <input
          id={fieldId("edit-due-date")}
          name="dueDate"
          type="date"
          defaultValue={todo.dueDate ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.dueDate)}
          className="mt-2 h-10 w-full border border-neutral-300 px-3 text-sm outline-none focus:border-emerald-700 aria-invalid:border-red-500"
        />
        {state.fieldErrors?.dueDate ? (
          <p className="mt-1 text-xs text-red-700">
            {state.fieldErrors.dueDate}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={fieldId("edit-priority")} className="text-sm font-medium">
          우선순위
        </label>
        <select
          id={fieldId("edit-priority")}
          name="priority"
          defaultValue={String(todo.priority)}
          aria-invalid={Boolean(state.fieldErrors?.priority)}
          className="mt-2 h-10 w-full border border-neutral-300 px-3 text-sm outline-none focus:border-emerald-700 aria-invalid:border-red-500"
        >
          <option value="1">High</option>
          <option value="2">Normal</option>
          <option value="3">Low</option>
        </select>
        {state.fieldErrors?.priority ? (
          <p className="mt-1 text-xs text-red-700">
            {state.fieldErrors.priority}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p
          aria-live="polite"
          className={`text-sm sm:col-span-2 ${
            state.status === "error" ? "text-red-700" : "text-emerald-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 sm:col-span-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => setEditing(false)}
          className="inline-flex h-9 items-center gap-1.5 border border-neutral-200 px-3 text-sm text-neutral-600 disabled:cursor-wait disabled:text-neutral-300"
        >
          <X size={14} aria-hidden="true" />
          취소
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center gap-1.5 bg-neutral-950 px-3 text-sm text-white disabled:cursor-wait disabled:bg-neutral-400"
        >
          {pending ? (
            <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
          ) : (
            <Pencil size={14} aria-hidden="true" />
          )}
          {pending ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}
