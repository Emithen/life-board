"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  ChevronRight,
  FilePlus2,
  FileText,
  LoaderCircle,
  X,
} from "lucide-react";
import { initialContentActionState } from "@/features/content/model";
import { createChildDocument } from "./content-actions";
import { DocumentFields } from "./document-fields";
import { TagBadge, type DocumentTag } from "./tag-badge";

type ChildDocument = {
  id: string;
  title: string;
  updatedAt: string;
  archived: boolean;
  childCount: number;
  tags: DocumentTag[];
};

function ChildDocumentCreateForm({
  parentId,
  onCancel,
}: {
  parentId: string;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    createChildDocument.bind(null, parentId),
    initialContentActionState,
  );

  return (
    <form action={action} className="grid gap-4 border-b border-neutral-100 bg-neutral-50 p-5">
      <DocumentFields
        idPrefix={`create-child-document-${parentId}`}
        errors={state.fieldErrors}
      />
      {state.message ? (
        <p aria-live="polite" className="text-sm text-red-700">
          {state.message}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className="inline-flex h-10 items-center gap-2 border border-neutral-200 bg-white px-3 text-sm"
        >
          <X size={15} aria-hidden="true" /> 취소
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center gap-2 bg-neutral-950 px-4 text-sm font-medium text-white disabled:bg-neutral-400"
        >
          {pending ? (
            <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
          ) : (
            <FilePlus2 size={15} aria-hidden="true" />
          )}
          {pending ? "만드는 중..." : "만들기"}
        </button>
      </div>
    </form>
  );
}

export function ChildDocumentSection({
  parentId,
  items,
  archived,
}: {
  parentId: string;
  items: ChildDocument[];
  archived: boolean;
}) {
  const [creating, setCreating] = useState(false);

  return (
    <section className="border border-neutral-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
        <h2 className="flex items-center gap-2 font-semibold">
          <FileText size={17} aria-hidden="true" /> 하위 문서
          <span className="text-sm font-normal text-neutral-400">{items.length}개</span>
        </h2>
        {!archived && !creating ? (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex h-9 items-center gap-2 border border-neutral-200 px-3 text-sm text-neutral-700 hover:border-neutral-950 hover:text-neutral-950"
          >
            <FilePlus2 size={15} aria-hidden="true" /> 하위 문서 추가
          </button>
        ) : null}
      </div>

      {creating ? (
        <ChildDocumentCreateForm
          parentId={parentId}
          onCancel={() => setCreating(false)}
        />
      ) : null}

      {items.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-neutral-500">
          <p>아직 하위 문서가 없습니다.</p>
          <p className="mt-1 text-xs text-neutral-400">
            이 문서에서 이어갈 내용을 만들어 보세요.
          </p>
          {!archived && !creating ? (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="mt-3 font-medium text-emerald-700 hover:underline"
            >
              첫 하위 문서 만들기
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/documents/${item.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-neutral-50"
              >
                <span className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="break-words font-medium">{item.title}</span>
                  {item.tags.slice(0, 3).map((tag) => <TagBadge key={tag.id} tag={tag} />)}
                  {item.tags.length > 3 ? <span className="text-xs text-neutral-400">+{item.tags.length - 3}</span> : null}
                </span>
                <span className="flex shrink-0 items-center gap-3 text-xs text-neutral-500">
                  {item.archived ? (
                    <span className="text-amber-700">보관됨</span>
                  ) : null}
                  {item.childCount > 0 ? (
                    <span>하위 문서 {item.childCount}개</span>
                  ) : null}
                  {item.updatedAt}
                  <ChevronRight size={16} aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
