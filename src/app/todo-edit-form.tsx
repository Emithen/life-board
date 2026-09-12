"use client";

import { useActionState, useState } from "react";
import { LoaderCircle, Pencil, X } from "lucide-react";
import { updateTodo } from "./actions";
import { TodoFields } from "./todo-fields";
import type {
  EditableTodo,
  TodoActionState,
} from "@/features/todos/model";

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

  return (
    <form
      action={formAction}
      aria-busy={pending}
      className="grid gap-4 border-t border-neutral-100 pt-4 sm:col-span-2"
    >
      <TodoFields
        idPrefix={`edit-todo-${todo.id}`}
        errors={state.fieldErrors}
        values={todo}
        compact
      />

      {state.message ? (
        <p
          aria-live="polite"
          className={`text-sm ${
            state.status === "error" ? "text-red-700" : "text-emerald-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
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
