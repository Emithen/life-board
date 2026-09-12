"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { initialContentActionState } from "@/features/content/model";
import { createTopic } from "./content-actions";
import { TopicFields } from "./topic-fields";

export function TopicForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState(
    createTopic,
    initialContentActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form
      ref={formRef}
      action={formAction}
      aria-busy={pending}
      className="flex flex-col gap-4 border border-neutral-200 bg-white p-5"
    >
      <TopicFields idPrefix="create-topic" errors={state.fieldErrors} />
      <button
        type="submit"
        disabled={!configured || pending}
        className="inline-flex h-11 items-center justify-center gap-2 bg-neutral-950 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        <Plus size={17} aria-hidden="true" />
        {pending ? "추가 중..." : "주제 추가"}
      </button>
      {state.message ? (
        <p
          aria-live="polite"
          className={`text-sm ${state.status === "error" ? "text-red-700" : "text-emerald-700"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
