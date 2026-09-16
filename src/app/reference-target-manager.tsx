"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  ArrowUpRight,
  Link2,
  LoaderCircle,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import {
  initialContentActionState,
  type NodeType,
} from "@/features/content/model";
import {
  deleteReferenceDocument,
  updateReferenceTarget,
} from "./content-actions";

type ReferenceTarget = {
  id: string;
  title: string;
  pathLabel: string;
  archived: boolean;
};

type ReferenceTargetOption = {
  id: string;
  pathLabel: string;
  nodeType: Exclude<NodeType, "reference">;
};

export function ReferenceTargetManager({
  referenceDocumentId,
  target,
  targets,
  archived,
}: {
  referenceDocumentId: string;
  target: ReferenceTarget | null;
  targets: ReferenceTargetOption[];
  archived: boolean;
}) {
  const [mode, setMode] = useState<"read" | "edit" | "delete">("read");
  const [updateState, updateAction, updating] = useActionState(
    updateReferenceTarget.bind(null, referenceDocumentId),
    initialContentActionState,
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteReferenceDocument.bind(null, referenceDocumentId),
    initialContentActionState,
  );
  return (
    <section className="border border-violet-200 bg-violet-50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        {target ? (
          <Link href={`/documents/${target.id}`} className="min-w-0 hover:text-violet-800">
            <span className="block text-xs font-medium text-violet-700">참조 대상 열기</span>
            <span className="mt-1 block break-words font-semibold">{target.title}</span>
            <span className="mt-1 block truncate text-xs text-neutral-500">{target.pathLabel}</span>
          </Link>
        ) : (
          <div>
            <p className="text-sm font-medium text-amber-900">연결된 참조 대상을 찾을 수 없습니다.</p>
            <p className="mt-1 text-xs text-neutral-500">대상을 다시 지정하면 참조를 복구할 수 있습니다.</p>
          </div>
        )}

        <div className="flex shrink-0 items-center gap-2">
          {target ? (
            <Link
              href={`/documents/${target.id}`}
              aria-label={`${target.title} 열기`}
              className="inline-flex h-9 items-center gap-2 border border-violet-200 bg-white px-3 text-sm text-violet-800"
            >
              {target.archived ? "보관됨" : "열기"} <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          ) : null}
          {!archived && mode === "read" ? (
            <>
              <button
                type="button"
                onClick={() => setMode("edit")}
                className="inline-flex h-9 items-center gap-2 border border-violet-200 bg-white px-3 text-sm text-violet-800"
              >
                <Pencil size={14} aria-hidden="true" /> 대상 변경
              </button>
              <button
                type="button"
                onClick={() => setMode("delete")}
                className="inline-flex h-9 items-center gap-2 border border-red-200 bg-white px-3 text-sm text-red-700"
              >
                <Trash2 size={14} aria-hidden="true" /> 참조 삭제
              </button>
            </>
          ) : null}
        </div>
      </div>

      {mode === "edit" ? (
        <form action={updateAction} className="mt-5 grid gap-3 border-t border-violet-200 pt-5">
          <label htmlFor={`reference-target-${referenceDocumentId}`} className="text-sm font-medium">
            새 참조 대상
          </label>
          <select
            id={`reference-target-${referenceDocumentId}`}
            name="targetDocumentId"
            required
            defaultValue={target?.id ?? ""}
            disabled={updating || targets.length === 0}
            className="h-11 border border-violet-200 bg-white px-3 text-sm"
          >
            {!target ? <option value="" disabled>구조 또는 개념 노드 선택</option> : null}
            {targets.map((option) => (
              <option key={option.id} value={option.id}>
                {option.pathLabel} · {option.nodeType === "structure" ? "구조" : "개념"}
              </option>
            ))}
          </select>
          {updateState.message ? (
            <p aria-live="polite" className={updateState.status === "error" ? "text-sm text-red-700" : "text-sm text-emerald-700"}>
              {updateState.message}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button type="button" disabled={updating} onClick={() => setMode("read")} className="inline-flex h-9 items-center gap-2 border border-violet-200 bg-white px-3 text-sm">
              <X size={14} aria-hidden="true" /> 취소
            </button>
            <button type="submit" disabled={updating || targets.length === 0} className="inline-flex h-9 items-center gap-2 bg-violet-800 px-3 text-sm font-medium text-white disabled:bg-neutral-400">
              {updating ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <Link2 size={14} aria-hidden="true" />}
              {updating ? "변경 중..." : "대상 변경"}
            </button>
          </div>
        </form>
      ) : null}

      {mode === "delete" ? (
        <form action={deleteAction} className="mt-5 grid gap-3 border-t border-red-200 pt-5">
          <div>
            <p className="text-sm font-medium text-red-800">이 참조를 영구 삭제할까요?</p>
            <p className="mt-1 text-xs text-neutral-600">
              참조만 삭제되며 대상 문서는 유지됩니다. 삭제한 참조는 복구할 수 없습니다.
            </p>
          </div>
          {deleteState.message ? (
            <p aria-live="polite" className="text-sm text-red-700">
              {deleteState.message}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setMode("read")}
              className="inline-flex h-9 items-center gap-2 border border-violet-200 bg-white px-3 text-sm"
            >
              <X size={14} aria-hidden="true" /> 취소
            </button>
            <button
              type="submit"
              disabled={deleting}
              className="inline-flex h-9 items-center gap-2 bg-red-700 px-3 text-sm font-medium text-white disabled:bg-neutral-400"
            >
              {deleting ? (
                <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 size={14} aria-hidden="true" />
              )}
              {deleting ? "삭제 중..." : "영구 삭제"}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
