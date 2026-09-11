"use client";

import { useActionState } from "react";
import {
  Archive,
  Check,
  Circle,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import {
  archiveTodo,
  restoreTodo,
  toggleTodo,
  type TodoActionState,
} from "./actions";

const initialState: TodoActionState = {
  status: "idle",
  message: "",
};

export function TodoToggleForm({
  id,
  completed,
}: {
  id: string;
  completed: boolean;
}) {
  const toggleAction = toggleTodo.bind(
    null,
    id,
    completed ? "active" : "completed",
  );
  const [state, formAction, pending] = useActionState(
    toggleAction,
    initialState,
  );

  return (
    <div>
      <form action={formAction} aria-busy={pending}>
        <button
          type="submit"
          disabled={pending}
          title={completed ? "미완료로 변경" : "완료로 변경"}
          className="mt-0.5 inline-flex size-6 items-center justify-center border border-neutral-300 text-emerald-700 disabled:cursor-wait disabled:text-neutral-400"
        >
          {pending ? (
            <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
          ) : completed ? (
            <Check size={15} aria-hidden="true" />
          ) : (
            <Circle size={14} aria-hidden="true" />
          )}
        </button>
      </form>
      {state.status === "error" ? (
        <p aria-live="polite" className="mt-1 max-w-40 text-xs text-red-700">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

export function TodoArchiveForm({ id }: { id: string }) {
  const archiveAction = archiveTodo.bind(null, id);
  const [state, formAction, pending] = useActionState(
    archiveAction,
    initialState,
  );

  return (
    <div>
      <form action={formAction} aria-busy={pending}>
        <button
          type="submit"
          disabled={pending}
          title="보관"
          className="inline-flex size-8 items-center justify-center border border-neutral-200 text-neutral-500 hover:text-neutral-950 disabled:cursor-wait disabled:text-neutral-300"
        >
          {pending ? (
            <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
          ) : (
            <Archive size={15} aria-hidden="true" />
          )}
        </button>
      </form>
      {state.status === "error" ? (
        <p
          aria-live="polite"
          className="mt-1 max-w-40 text-right text-xs text-red-700"
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

export function TodoRestoreForm({ id }: { id: string }) {
  const restoreAction = restoreTodo.bind(null, id);
  const [state, formAction, pending] = useActionState(
    restoreAction,
    initialState,
  );

  return (
    <div>
      <form action={formAction} aria-busy={pending}>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center gap-1.5 border border-neutral-300 px-3 text-sm text-neutral-700 hover:border-emerald-700 hover:text-emerald-700 disabled:cursor-wait disabled:text-neutral-300"
        >
          {pending ? (
            <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
          ) : (
            <RotateCcw size={15} aria-hidden="true" />
          )}
          {pending ? "복원 중..." : "복원"}
        </button>
      </form>
      {state.status === "error" ? (
        <p aria-live="polite" className="mt-1 text-xs text-red-700">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
