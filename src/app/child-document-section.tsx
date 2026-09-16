"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  FilePlus2,
  FileText,
  Link2,
  LoaderCircle,
  Settings2,
  X,
} from "lucide-react";
import {
  canNodeContainChildren,
  initialContentActionState,
  type NodeType,
} from "@/features/content/model";
import {
  filterAndSortNodes,
  type NodeListFilter,
  type NodeListSort,
} from "@/features/content/node-list";
import {
  createChildDocument,
  createReferenceDocument,
} from "./content-actions";
import { DocumentFields } from "./document-fields";
import { NodeTypeBadge } from "./node-type-badge";
import { NodeTypeFields } from "./node-type-fields";
import { TagBadge, type DocumentTag } from "./tag-badge";

type ChildDocument = {
  id: string;
  title: string;
  updatedAt: string;
  updatedAtValue: number;
  archived: boolean;
  childCount: number;
  nodeType: NodeType;
  referenceTarget: {
    id: string;
    title: string;
    archived: boolean;
  } | null;
  tags: DocumentTag[];
};

type ReferenceTarget = {
  id: string;
  title: string;
  pathLabel: string;
  nodeType: Exclude<NodeType, "reference">;
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
      <NodeTypeFields
        idPrefix={`create-child-document-${parentId}`}
        error={state.fieldErrors?.nodeType}
      />
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

function ReferenceDocumentCreateForm({
  parentId,
  targets,
  onCancel,
}: {
  parentId: string;
  targets: ReferenceTarget[];
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    createReferenceDocument.bind(null, parentId),
    initialContentActionState,
  );

  return (
    <form action={action} className="grid gap-4 border-b border-neutral-100 bg-neutral-50 p-5">
      <div className="grid gap-2">
        <label htmlFor={`create-reference-${parentId}-target`} className="text-sm font-medium">
          참조 대상
        </label>
        <select
          id={`create-reference-${parentId}-target`}
          name="targetDocumentId"
          required
          defaultValue=""
          disabled={pending || targets.length === 0}
          aria-describedby={state.fieldErrors?.targetDocumentId ? `create-reference-${parentId}-target-error` : undefined}
          className="h-11 border border-neutral-300 bg-white px-3 text-sm disabled:bg-neutral-100"
        >
          <option value="" disabled>구조 또는 개념 노드 선택</option>
          {targets.map((target) => (
            <option key={target.id} value={target.id}>
              {target.pathLabel} · {target.nodeType === "structure" ? "구조" : "개념"}
            </option>
          ))}
        </select>
        {state.fieldErrors?.targetDocumentId ? (
          <p id={`create-reference-${parentId}-target-error`} className="text-sm text-red-700">
            {state.fieldErrors.targetDocumentId}
          </p>
        ) : null}
        {targets.length === 0 ? (
          <p className="text-sm text-amber-700">현재 경로에서 참조할 수 있는 노드가 없습니다.</p>
        ) : (
          <p className="text-xs text-neutral-500">
            구조 노드와 현재 경로에 공개된 개념 노드만 표시됩니다.
          </p>
        )}
      </div>
      {state.message ? (
        <p aria-live="polite" className="text-sm text-red-700">{state.message}</p>
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
          disabled={pending || targets.length === 0}
          className="inline-flex h-10 items-center gap-2 bg-neutral-950 px-4 text-sm font-medium text-white disabled:bg-neutral-400"
        >
          {pending ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Link2 size={15} aria-hidden="true" />}
          {pending ? "만드는 중..." : "참조 만들기"}
        </button>
      </div>
    </form>
  );
}

export function ChildDocumentSection({
  parentId,
  parentNodeType,
  items,
  referenceTargets,
  archived,
}: {
  parentId: string;
  parentNodeType: NodeType;
  items: ChildDocument[];
  referenceTargets: ReferenceTarget[];
  archived: boolean;
}) {
  const [creating, setCreating] = useState<"document" | "reference" | null>(null);
  const [filter, setFilter] = useState<NodeListFilter>("all");
  const [sort, setSort] = useState<NodeListSort>("updated-desc");
  const canCreateChild = canNodeContainChildren(parentNodeType);
  const visibleItems = useMemo(
    () => filterAndSortNodes(items, filter, sort),
    [filter, items, sort],
  );

  return (
    <section className="border border-neutral-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
        <h2 className="flex items-center gap-2 font-semibold">
          <FileText size={17} aria-hidden="true" /> 구성 요소
          <span className="text-sm font-normal text-neutral-400">
            {filter === "all" ? `${items.length}개` : `${visibleItems.length}/${items.length}개`}
          </span>
        </h2>
        {!archived && canCreateChild && !creating ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCreating("reference")}
              className="inline-flex h-9 items-center gap-2 border border-neutral-200 px-3 text-sm text-neutral-700 hover:border-neutral-950 hover:text-neutral-950"
            >
              <Link2 size={15} aria-hidden="true" /> 참조 추가
            </button>
            <button
              type="button"
              onClick={() => setCreating("document")}
              className="inline-flex h-9 items-center gap-2 border border-neutral-200 px-3 text-sm text-neutral-700 hover:border-neutral-950 hover:text-neutral-950"
            >
              <FilePlus2 size={15} aria-hidden="true" /> 하위 문서 추가
            </button>
          </div>
        ) : null}
      </div>

      {creating === "document" && canCreateChild ? (
        <ChildDocumentCreateForm
          parentId={parentId}
          onCancel={() => setCreating(null)}
        />
      ) : null}

      {creating === "reference" && canCreateChild ? (
        <ReferenceDocumentCreateForm
          parentId={parentId}
          targets={referenceTargets}
          onCancel={() => setCreating(null)}
        />
      ) : null}

      {items.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-5 py-3">
          <label htmlFor={`node-filter-${parentId}`} className="sr-only">유형 필터</label>
          <select
            id={`node-filter-${parentId}`}
            value={filter}
            onChange={(event) => setFilter(event.target.value as NodeListFilter)}
            className="h-9 border border-neutral-200 bg-white px-3 text-sm"
          >
            <option value="all">모든 유형</option>
            <option value="structure">구조</option>
            <option value="concept">개념</option>
            <option value="reference">참조</option>
          </select>
          <label htmlFor={`node-sort-${parentId}`} className="sr-only">정렬</label>
          <select
            id={`node-sort-${parentId}`}
            value={sort}
            onChange={(event) => setSort(event.target.value as NodeListSort)}
            className="h-9 border border-neutral-200 bg-white px-3 text-sm"
          >
            <option value="updated-desc">최근 수정순</option>
            <option value="title-asc">제목순</option>
            <option value="type">유형순</option>
          </select>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-neutral-500">
          {!canCreateChild ? (
            <p className="text-amber-700">
              {parentNodeType === "concept" ? "개념" : "참조"} 노드는 하위 노드를 가질 수 없습니다.
            </p>
          ) : (
            <>
              <p>아직 구성 요소가 없습니다.</p>
              <p className="mt-1 text-xs text-neutral-400">
                이 문서에서 이어갈 내용을 만들어 보세요.
              </p>
              {!archived && !creating ? (
                <button
                  type="button"
                  onClick={() => setCreating("document")}
                  className="mt-3 font-medium text-emerald-700 hover:underline"
                >
                  첫 노드 만들기
                </button>
              ) : null}
            </>
          )}
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-neutral-500">
          선택한 유형의 구성 요소가 없습니다.
        </div>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {visibleItems.map((item) => (
            <li key={item.id} className="flex items-stretch">
              <Link
                href={`/documents/${item.referenceTarget?.id ?? item.id}`}
                className="flex min-w-0 flex-1 items-center justify-between gap-4 px-5 py-4 hover:bg-neutral-50"
              >
                <span className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="break-words font-medium">{item.title}</span>
                  <NodeTypeBadge nodeType={item.nodeType} />
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
                  {item.referenceTarget ? (
                    <ArrowUpRight size={16} aria-hidden="true" />
                  ) : (
                    <ChevronRight size={16} aria-hidden="true" />
                  )}
                </span>
              </Link>
              {item.referenceTarget ? (
                <Link
                  href={`/documents/${item.id}`}
                  aria-label={`${item.title} 참조 관리`}
                  title="참조 관리"
                  className="inline-flex w-12 shrink-0 items-center justify-center border-l border-neutral-100 text-neutral-400 hover:bg-violet-50 hover:text-violet-800"
                >
                  <Settings2 size={16} aria-hidden="true" />
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
