"use client";

import { useActionState, useState } from "react";
import { Archive, LoaderCircle, Pencil, RotateCcw, X } from "lucide-react";
import { initialContentActionState } from "@/features/content/model";
import {
  archiveDocument,
  restoreDocument,
  updateDocument,
} from "./content-actions";
import { DocumentFields } from "./document-fields";

type DocumentItemProps = {
  topicId: string;
  document: {
    id: string;
    title: string;
    content: string | null;
    updatedAt: string;
  };
  archived?: boolean;
};

function DocumentRestoreForm({ topicId, id }: { topicId: string; id: string }) {
  const [state, action, pending] = useActionState(
    restoreDocument.bind(null, topicId, id),
    initialContentActionState,
  );
  return (
    <div>
      <form action={action}>
        <button type="submit" disabled={pending} className="inline-flex h-9 items-center gap-1.5 border border-neutral-300 px-3 text-sm hover:border-emerald-700 hover:text-emerald-700 disabled:text-neutral-300">
          {pending ? <LoaderCircle size={15} className="animate-spin" /> : <RotateCcw size={15} />}
          {pending ? "복원 중..." : "복원"}
        </button>
      </form>
      {state.status === "error" ? <p className="mt-1 text-xs text-red-700">{state.message}</p> : null}
    </div>
  );
}

export function DocumentItem({ topicId, document, archived = false }: DocumentItemProps) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction, updating] = useActionState(
    updateDocument.bind(null, topicId, document.id),
    initialContentActionState,
  );
  const [archiveState, archiveAction, archiving] = useActionState(
    archiveDocument.bind(null, topicId, document.id),
    initialContentActionState,
  );

  return (
    <article className="border-b border-neutral-100 p-5 last:border-b-0">
      {editing && !archived ? (
        <form action={updateAction} className="grid gap-4">
          <DocumentFields idPrefix={`edit-document-${document.id}`} errors={updateState.fieldErrors} values={document} />
          {updateState.message ? <p className={`text-sm ${updateState.status === "error" ? "text-red-700" : "text-emerald-700"}`}>{updateState.message}</p> : null}
          <div className="flex justify-end gap-2">
            <button type="button" disabled={updating} onClick={() => setEditing(false)} className="inline-flex h-9 items-center gap-1.5 border border-neutral-200 px-3 text-sm"><X size={14} /> 취소</button>
            <button type="submit" disabled={updating} className="inline-flex h-9 items-center gap-1.5 bg-neutral-950 px-3 text-sm text-white disabled:bg-neutral-400">
              {updating ? <LoaderCircle size={14} className="animate-spin" /> : <Pencil size={14} />}
              {updating ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="min-w-0">
            <h2 className="break-words text-base font-medium">{document.title}</h2>
            {document.content ? <p className="mt-2 whitespace-pre-wrap break-words font-mono text-sm leading-6 text-neutral-600">{document.content}</p> : null}
            <p className="mt-3 text-xs text-neutral-400">{document.updatedAt} 수정</p>
          </div>
          <div className="flex items-start gap-2">
            {archived ? (
              <DocumentRestoreForm topicId={topicId} id={document.id} />
            ) : (
              <>
                <button type="button" onClick={() => setEditing(true)} className="inline-flex size-9 items-center justify-center border border-neutral-200 text-neutral-500 hover:text-neutral-950" title="문서 수정"><Pencil size={15} /></button>
                <form action={archiveAction}>
                  <button type="submit" disabled={archiving} className="inline-flex size-9 items-center justify-center border border-neutral-200 text-neutral-500 hover:text-neutral-950 disabled:text-neutral-300" title="문서 보관">
                    {archiving ? <LoaderCircle size={15} className="animate-spin" /> : <Archive size={15} />}
                  </button>
                </form>
              </>
            )}
          </div>
          {archiveState.status === "error" ? <p className="text-xs text-red-700 sm:col-span-2">{archiveState.message}</p> : null}
        </div>
      )}
    </article>
  );
}
