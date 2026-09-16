"use client";

import { useActionState } from "react";
import { LoaderCircle, Plus, Tags, X } from "lucide-react";
import {
  initialTagActionState,
  type TagColor,
} from "@/features/content/model";
import {
  attachDocumentTag,
  createAndAttachDocumentTag,
  removeDocumentTag,
} from "./content-actions";
import { TagBadge, type DocumentTag } from "./tag-badge";

const colorOptions: { value: TagColor; label: string }[] = [
  { value: "gray", label: "회색" },
  { value: "blue", label: "파랑" },
  { value: "green", label: "초록" },
  { value: "amber", label: "주황" },
  { value: "red", label: "빨강" },
  { value: "violet", label: "보라" },
];

export function DocumentTagManager({
  documentId,
  assignedTags,
  availableTags,
  archived,
}: {
  documentId: string;
  assignedTags: DocumentTag[];
  availableTags: DocumentTag[];
  archived: boolean;
}) {
  const [attachState, attachAction, attaching] = useActionState(
    attachDocumentTag.bind(null, documentId),
    initialTagActionState,
  );
  const [createState, createAction, creating] = useActionState(
    createAndAttachDocumentTag.bind(null, documentId),
    initialTagActionState,
  );
  const assignedIds = new Set(assignedTags.map((tag) => tag.id));
  const attachableTags = availableTags.filter((tag) => !assignedIds.has(tag.id));

  return (
    <section className="border border-neutral-200 bg-white p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Tags size={16} aria-hidden="true" /> 태그
        <span className="text-sm font-normal text-neutral-400">
          {assignedTags.length}
        </span>
      </h2>

      {assignedTags.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">아직 지정된 태그가 없습니다.</p>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-2">
          {assignedTags.map((tag) => (
            <li key={tag.id} className="inline-flex items-center gap-1">
              <TagBadge tag={tag} />
              {!archived ? (
                <form action={removeDocumentTag.bind(null, documentId, tag.id)}>
                  <button
                    type="submit"
                    className="inline-flex size-6 items-center justify-center text-neutral-400 hover:text-red-700"
                    aria-label={`${tag.name} 태그 제거`}
                    title="태그 제거"
                  >
                    <X size={13} aria-hidden="true" />
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {!archived ? (
        <details className="mt-5 border-t border-neutral-100 pt-4">
          <summary className="cursor-pointer text-sm font-medium text-neutral-700">
            태그 관리
          </summary>

          <form action={attachAction} className="mt-4 grid gap-2">
            <label htmlFor={`attach-tag-${documentId}`} className="text-xs font-medium">
              기존 태그 추가
            </label>
            <div className="flex gap-2">
              <select
                id={`attach-tag-${documentId}`}
                name="tagId"
                required
                disabled={attaching || attachableTags.length === 0}
                defaultValue=""
                className="h-9 min-w-0 flex-1 border border-neutral-300 bg-white px-2 text-sm outline-none focus:border-emerald-700 disabled:bg-neutral-100"
              >
                <option value="" disabled>
                  {attachableTags.length === 0 ? "추가할 태그 없음" : "태그 선택"}
                </option>
                {attachableTags.map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={attaching || attachableTags.length === 0}
                className="inline-flex size-9 shrink-0 items-center justify-center bg-neutral-950 text-white disabled:bg-neutral-300"
                aria-label="선택한 태그 추가"
              >
                {attaching ? <LoaderCircle size={14} className="animate-spin" /> : <Plus size={15} />}
              </button>
            </div>
            {attachState.message ? (
              <p className={`text-xs ${attachState.status === "error" ? "text-red-700" : "text-emerald-700"}`}>
                {attachState.message}
              </p>
            ) : null}
          </form>

          <form action={createAction} className="mt-5 grid gap-2 border-t border-neutral-100 pt-4">
            <label htmlFor={`create-tag-${documentId}`} className="text-xs font-medium">
              새 태그 만들기
            </label>
            <input
              id={`create-tag-${documentId}`}
              name="name"
              required
              maxLength={30}
              placeholder="예: 포화"
              aria-invalid={Boolean(createState.fieldErrors?.name)}
              className="h-9 border border-neutral-300 px-2 text-sm outline-none focus:border-emerald-700 aria-invalid:border-red-500"
            />
            <div className="flex gap-2">
              <select
                name="color"
                defaultValue="amber"
                className="h-9 min-w-0 flex-1 border border-neutral-300 bg-white px-2 text-sm outline-none focus:border-emerald-700"
              >
                {colorOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex h-9 items-center gap-1.5 bg-neutral-950 px-3 text-sm text-white disabled:bg-neutral-400"
              >
                {creating ? <LoaderCircle size={14} className="animate-spin" /> : <Plus size={14} />}
                만들기
              </button>
            </div>
            {createState.message ? (
              <p className={`text-xs ${createState.status === "error" ? "text-red-700" : "text-emerald-700"}`}>
                {createState.message}
              </p>
            ) : null}
          </form>
        </details>
      ) : null}
    </section>
  );
}
