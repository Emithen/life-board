"use client";

import { useActionState, useState } from "react";
import { Archive, LoaderCircle, Pencil, RotateCcw, X } from "lucide-react";
import { initialContentActionState } from "@/features/content/model";
import { archiveTopic, restoreTopic, updateTopic } from "./content-actions";
import { TopicFields } from "./topic-fields";

export function TopicArchiveForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(
    archiveTopic.bind(null, id),
    initialContentActionState,
  );
  return (
    <div>
      <form action={action}>
        <button
          type="submit"
          disabled={pending}
          title="문서 보관"
          className="inline-flex size-9 items-center justify-center border border-neutral-200 text-neutral-500 hover:text-neutral-950 disabled:text-neutral-300"
        >
          {pending ? <LoaderCircle size={15} className="animate-spin" /> : <Archive size={15} />}
        </button>
      </form>
      {state.status === "error" ? (
        <p aria-live="polite" className="mt-1 text-xs text-red-700">{state.message}</p>
      ) : null}
    </div>
  );
}

export function TopicRestoreForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(
    restoreTopic.bind(null, id),
    initialContentActionState,
  );
  return (
    <div>
      <form action={action}>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center gap-1.5 border border-neutral-300 px-3 text-sm hover:border-emerald-700 hover:text-emerald-700 disabled:text-neutral-300"
        >
          {pending ? <LoaderCircle size={15} className="animate-spin" /> : <RotateCcw size={15} />}
          {pending ? "복원 중..." : "복원"}
        </button>
      </form>
      {state.status === "error" ? (
        <p aria-live="polite" className="mt-1 text-xs text-red-700">{state.message}</p>
      ) : null}
    </div>
  );
}

export function TopicEditForm({
  topic,
}: {
  topic: { id: string; name: string; description: string | null; color: string };
}) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(
    updateTopic.bind(null, topic.id),
    initialContentActionState,
  );

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex h-9 items-center gap-1.5 border border-neutral-200 px-3 text-sm text-neutral-600 hover:text-neutral-950"
      >
        <Pencil size={14} /> 수정
      </button>
    );
  }

  return (
    <form action={action} className="mt-4 grid min-w-0 flex-1 gap-4 border-t border-neutral-200 pt-4">
      <TopicFields idPrefix={`edit-topic-${topic.id}`} errors={state.fieldErrors} values={topic} />
      {state.message ? (
        <p className={state.status === "error" ? "text-sm text-red-700" : "text-sm text-emerald-700"}>
          {state.message}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <button type="button" disabled={pending} onClick={() => setEditing(false)} className="inline-flex h-9 items-center gap-1.5 border border-neutral-200 px-3 text-sm">
          <X size={14} /> 취소
        </button>
        <button type="submit" disabled={pending} className="inline-flex h-9 items-center gap-1.5 bg-neutral-950 px-3 text-sm text-white disabled:bg-neutral-400">
          {pending ? <LoaderCircle size={14} className="animate-spin" /> : <Pencil size={14} />}
          {pending ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}
