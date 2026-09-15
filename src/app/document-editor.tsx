"use client";

import { useActionState, useState } from "react";
import { Archive, LoaderCircle, Pencil, X } from "lucide-react";
import { initialContentActionState } from "@/features/content/model";
import {
  archiveDocumentFromDetail,
  updateDocumentFromDetail,
} from "./content-actions";
import { DocumentFields } from "./document-fields";
import { DocumentMarkdown } from "./document-markdown";
import styles from "./document-markdown.module.css";

type DocumentEditorProps = {
  document: {
    id: string;
    title: string;
    content: string | null;
    accentColor: string | null;
    updatedAt: string;
  };
  archived: boolean;
};

export function DocumentEditor({ document, archived }: DocumentEditorProps) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction, updating] = useActionState(
    updateDocumentFromDetail.bind(null, document.id),
    initialContentActionState,
  );
  const [archiveState, archiveAction, archiving] = useActionState(
    archiveDocumentFromDetail.bind(null, document.id),
    initialContentActionState,
  );

  return (
    <>
      <header className="border-b border-neutral-200 pb-6">
        {document.accentColor ? (
          <div
            className="mb-4 h-1.5 w-12"
            style={{ backgroundColor: document.accentColor }}
          />
        ) : null}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-semibold sm:text-4xl">
              {document.title}
            </h1>
            <p className="mt-3 text-xs text-neutral-500">
              {document.updatedAt} 수정
            </p>
          </div>
          {!archived && !editing ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex h-10 items-center gap-2 border border-neutral-300 bg-white px-3 text-sm hover:border-neutral-950"
              >
                <Pencil size={15} aria-hidden="true" /> 편집
              </button>
              <form action={archiveAction}>
                <button
                  type="submit"
                  disabled={archiving}
                  className="inline-flex h-10 items-center gap-2 border border-neutral-300 bg-white px-3 text-sm text-neutral-600 hover:border-amber-700 hover:text-amber-800 disabled:text-neutral-300"
                >
                  {archiving ? (
                    <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Archive size={15} aria-hidden="true" />
                  )}
                  {archiving ? "보관 중..." : "보관"}
                </button>
              </form>
            </div>
          ) : null}
        </div>
        {archiveState.status === "error" ? (
          <p aria-live="polite" className="mt-3 text-sm text-red-700">
            {archiveState.message}
          </p>
        ) : null}
      </header>

      <section
        aria-label={editing ? "문서 편집" : "문서 본문"}
        className="min-h-44 border border-neutral-200 bg-white p-6"
      >
        {editing ? (
          <form action={updateAction} className="grid gap-4">
            <DocumentFields
              idPrefix={`edit-document-${document.id}`}
              errors={updateState.fieldErrors}
              values={{ title: document.title, content: document.content }}
            />
            {updateState.message ? (
              <p
                aria-live="polite"
                className={
                  updateState.status === "error"
                    ? "text-sm text-red-700"
                    : "text-sm text-emerald-700"
                }
              >
                {updateState.message}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={updating}
                onClick={() => setEditing(false)}
                className="inline-flex h-10 items-center gap-2 border border-neutral-200 px-3 text-sm"
              >
                <X size={15} aria-hidden="true" /> 취소
              </button>
              <button
                type="submit"
                disabled={updating}
                className="inline-flex h-10 items-center gap-2 bg-neutral-950 px-4 text-sm font-medium text-white disabled:bg-neutral-400"
              >
                {updating ? (
                  <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Pencil size={15} aria-hidden="true" />
                )}
                {updating ? "저장 중..." : "저장"}
              </button>
            </div>
          </form>
        ) : document.content ? (
          <div className={`${styles.content} text-sm leading-7 text-neutral-700`}>
            <DocumentMarkdown content={document.content} />
          </div>
        ) : (
          <p className="text-sm text-neutral-400">아직 작성된 본문이 없습니다.</p>
        )}
      </section>
    </>
  );
}
