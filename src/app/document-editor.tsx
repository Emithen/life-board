"use client";

import { useActionState, useState } from "react";
import { FolderInput, Layers2, LoaderCircle, Pencil, X } from "lucide-react";
import {
  initialContentActionState,
  type NodeType,
} from "@/features/content/model";
import {
  changeDocumentNodeType,
  moveDocument,
  updateDocumentFromDetail,
} from "./content-actions";
import { DocumentFields } from "./document-fields";
import { DocumentMarkdown } from "./document-markdown";
import { NodeTypeBadge } from "./node-type-badge";
import { NodeTypeFields } from "./node-type-fields";
import { TagBadge, type DocumentTag } from "./tag-badge";
import styles from "./document-markdown.module.css";

type DocumentEditorProps = {
  document: {
    id: string;
    title: string;
    content: string | null;
    accentColor: string | null;
    updatedAt: string;
    parentId: string | null;
    nodeType: NodeType;
  };
  moveDestinations: { id: string; pathLabel: string }[];
  tags: DocumentTag[];
  archived: boolean;
};

export function DocumentEditor({
  document,
  moveDestinations,
  tags,
  archived,
}: DocumentEditorProps) {
  const [mode, setMode] = useState<"read" | "edit" | "move" | "type">("read");
  const [updateState, updateAction, updating] = useActionState(
    updateDocumentFromDetail.bind(null, document.id),
    initialContentActionState,
  );
  const [moveState, moveAction, moving] = useActionState(
    moveDocument.bind(null, document.id),
    initialContentActionState,
  );
  const [typeState, typeAction, changingType] = useActionState(
    changeDocumentNodeType.bind(null, document.id),
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
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-words text-3xl font-semibold sm:text-4xl">
                {document.title}
              </h1>
              <NodeTypeBadge nodeType={document.nodeType} />
              {tags.map((tag) => <TagBadge key={tag.id} tag={tag} />)}
            </div>
            <p className="mt-3 text-xs text-neutral-500">
              {document.updatedAt} 수정
            </p>
          </div>
          {!archived && mode === "read" ? (
            <div className="flex items-center gap-2">
              {document.nodeType !== "reference" ? (
                <button
                  type="button"
                  onClick={() => setMode("edit")}
                  className="inline-flex h-10 items-center gap-2 border border-neutral-300 bg-white px-3 text-sm hover:border-neutral-950"
                >
                  <Pencil size={15} aria-hidden="true" /> 편집
                </button>
              ) : null}
              {document.nodeType !== "reference" ? (
                <button
                  type="button"
                  onClick={() => setMode("type")}
                  className="inline-flex h-10 items-center gap-2 border border-neutral-300 bg-white px-3 text-sm hover:border-neutral-950"
                >
                  <Layers2 size={15} aria-hidden="true" /> 유형 변경
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setMode("move")}
                className="inline-flex h-10 items-center gap-2 border border-neutral-300 bg-white px-3 text-sm hover:border-neutral-950"
              >
                <FolderInput size={15} aria-hidden="true" /> 이동
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {mode !== "read" || document.nodeType !== "reference" ? <section
        aria-label={
          mode === "edit"
            ? "문서 편집"
            : mode === "type"
              ? "노드 유형 변경"
            : mode === "move"
              ? "문서 이동"
              : "문서 본문"
        }
        className="min-h-44 border border-neutral-200 bg-white p-6"
      >
        {mode === "edit" ? (
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
                onClick={() => setMode("read")}
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
        ) : mode === "type" && document.nodeType !== "reference" ? (
          <form action={typeAction} className="grid gap-4">
            <NodeTypeFields
              idPrefix={`change-document-type-${document.id}`}
              defaultValue={document.nodeType}
              error={typeState.fieldErrors?.nodeType}
            />
            <p className="text-xs text-neutral-500">
              하위 구성 요소가 있는 구조 노드는 개념으로 변경할 수 없습니다.
            </p>
            {typeState.message ? (
              <p
                aria-live="polite"
                className={
                  typeState.status === "error"
                    ? "text-sm text-red-700"
                    : "text-sm text-emerald-700"
                }
              >
                {typeState.message}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={changingType}
                onClick={() => setMode("read")}
                className="inline-flex h-10 items-center gap-2 border border-neutral-200 px-3 text-sm"
              >
                <X size={15} aria-hidden="true" /> 취소
              </button>
              <button
                type="submit"
                disabled={changingType}
                className="inline-flex h-10 items-center gap-2 bg-neutral-950 px-4 text-sm font-medium text-white disabled:bg-neutral-400"
              >
                {changingType ? (
                  <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Layers2 size={15} aria-hidden="true" />
                )}
                {changingType ? "변경 중..." : "유형 변경"}
              </button>
            </div>
          </form>
        ) : mode === "move" ? (
          <form action={moveAction} className="grid gap-4">
            <div>
              <label htmlFor={`move-document-${document.id}`} className="text-sm font-medium">
                이동할 위치
              </label>
              <select
                id={`move-document-${document.id}`}
                name="parentId"
                defaultValue={document.parentId ?? ""}
                className="mt-2 h-11 w-full border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-emerald-700"
              >
                {document.nodeType !== "reference" ? (
                  <option value="">문서 목록에 바로 표시</option>
                ) : null}
                {moveDestinations.map((destination) => (
                  <option key={destination.id} value={destination.id}>
                    {destination.pathLabel}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-neutral-500">
                {document.nodeType === "reference"
                  ? "현재 참조 대상을 사용할 수 있는 구조 노드만 표시됩니다."
                  : "선택한 문서 안으로 현재 문서와 모든 하위 문서가 함께 이동합니다."}
              </p>
            </div>
            {moveState.message ? (
              <p
                aria-live="polite"
                className={
                  moveState.status === "error"
                    ? "text-sm text-red-700"
                    : "text-sm text-emerald-700"
                }
              >
                {moveState.message}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={moving}
                onClick={() => setMode("read")}
                className="inline-flex h-10 items-center gap-2 border border-neutral-200 px-3 text-sm"
              >
                <X size={15} aria-hidden="true" /> 취소
              </button>
              <button
                type="submit"
                disabled={moving}
                className="inline-flex h-10 items-center gap-2 bg-neutral-950 px-4 text-sm font-medium text-white disabled:bg-neutral-400"
              >
                {moving ? (
                  <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
                ) : (
                  <FolderInput size={15} aria-hidden="true" />
                )}
                {moving ? "이동 중..." : "이동"}
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
      </section> : null}
    </>
  );
}
