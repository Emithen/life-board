"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { createTodo } from "./actions";
import { TodoFields } from "./todo-fields";
import type { TodoActionState } from "@/features/todos/model";

const initialState: TodoActionState = {
  status: "idle",
  message: "",
};

export function TodoForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState(createTodo, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form
      ref={formRef}
      action={formAction}
      aria-busy={pending}
      className="flex flex-col gap-4 border border-neutral-200 bg-white p-5"
    >
      <TodoFields idPrefix="create-todo" errors={state.fieldErrors} />

      <button
        type="submit"
        disabled={!configured || pending}
        className="inline-flex h-11 items-center justify-center gap-2 bg-neutral-950 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        <Plus size={17} aria-hidden="true" />
        {pending ? "추가 중..." : "추가"}
      </button>

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
    </form>
  );
}
