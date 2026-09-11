"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { createTodo, type TodoActionState } from "./actions";

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
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      aria-busy={pending}
      className="flex flex-col gap-4 border border-neutral-200 bg-white p-5"
    >
      <div>
        <label htmlFor="title" className="text-sm font-medium">
          새 todo
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={120}
          aria-invalid={Boolean(state.fieldErrors?.title)}
          aria-describedby={state.fieldErrors?.title ? "title-error" : undefined}
          placeholder="해야 할 일을 입력"
          className="mt-2 h-11 w-full border border-neutral-300 px-3 text-sm outline-none focus:border-emerald-700 aria-invalid:border-red-500"
        />
        {state.fieldErrors?.title ? (
          <p id="title-error" className="mt-1 text-xs text-red-700">
            {state.fieldErrors.title}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="notes" className="text-sm font-medium">
          메모
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          maxLength={2000}
          aria-invalid={Boolean(state.fieldErrors?.notes)}
          aria-describedby={state.fieldErrors?.notes ? "notes-error" : undefined}
          placeholder="상세 내용"
          className="mt-2 w-full resize-none border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 aria-invalid:border-red-500"
        />
        {state.fieldErrors?.notes ? (
          <p id="notes-error" className="mt-1 text-xs text-red-700">
            {state.fieldErrors.notes}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="dueDate" className="text-sm font-medium">
            마감일
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            aria-invalid={Boolean(state.fieldErrors?.dueDate)}
            aria-describedby={
              state.fieldErrors?.dueDate ? "due-date-error" : undefined
            }
            className="mt-2 h-11 w-full border border-neutral-300 px-3 text-sm outline-none focus:border-emerald-700 aria-invalid:border-red-500"
          />
          {state.fieldErrors?.dueDate ? (
            <p id="due-date-error" className="mt-1 text-xs text-red-700">
              {state.fieldErrors.dueDate}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="priority" className="text-sm font-medium">
            우선순위
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue="2"
            aria-invalid={Boolean(state.fieldErrors?.priority)}
            aria-describedby={
              state.fieldErrors?.priority ? "priority-error" : undefined
            }
            className="mt-2 h-11 w-full border border-neutral-300 px-3 text-sm outline-none focus:border-emerald-700 aria-invalid:border-red-500"
          >
            <option value="1">High</option>
            <option value="2">Normal</option>
            <option value="3">Low</option>
          </select>
          {state.fieldErrors?.priority ? (
            <p id="priority-error" className="mt-1 text-xs text-red-700">
              {state.fieldErrors.priority}
            </p>
          ) : null}
        </div>
      </div>

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
