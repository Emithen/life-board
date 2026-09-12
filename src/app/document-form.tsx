"use client";

import { useActionState, useEffect, useRef } from "react";
import { FilePlus2 } from "lucide-react";
import { initialContentActionState } from "@/features/content/model";
import { createDocument } from "./content-actions";
import { DocumentFields } from "./document-fields";

export function DocumentForm({ topicId }: { topicId: string }) {
  const [state, action, pending] = useActionState(
    createDocument.bind(null, topicId),
    initialContentActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4 border border-neutral-200 bg-white p-5">
      <DocumentFields idPrefix={`create-document-${topicId}`} errors={state.fieldErrors} />
      <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center gap-2 bg-neutral-950 px-4 text-sm font-medium text-white disabled:bg-neutral-400">
        <FilePlus2 size={17} aria-hidden="true" />
        {pending ? "저장 중..." : "문서 추가"}
      </button>
      {state.message ? (
        <p aria-live="polite" className={`text-sm ${state.status === "error" ? "text-red-700" : "text-emerald-700"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
