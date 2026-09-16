import Link from "next/link";
import { ArrowUpRight, ChevronRight, Link2 } from "lucide-react";
import { notFound } from "next/navigation";
import { getDocumentReadView } from "@/features/content/read-repository";
import { isValidContentId } from "@/features/content/validation";
import { DocumentEditor } from "../../document-editor";
import { ChildDocumentSection } from "../../child-document-section";
import { DocumentTagManager } from "../../document-tag-manager";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function RelatedDocuments({
  title,
  items,
}: {
  title: string;
  items: { id: string; title: string; archived: boolean }[];
}) {
  return (
    <section className="border border-neutral-200 bg-white p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold"><Link2 size={16} aria-hidden="true" /> {title} <span className="text-sm font-normal text-neutral-400">{items.length}</span></h2>
      {items.length === 0 ? (
        <p className="mt-5 text-sm text-neutral-500">연결된 문서가 없습니다.</p>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-100">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`/documents/${item.id}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-emerald-700">
                <span className="min-w-0 break-words">{item.title}</span>
                <span className="flex shrink-0 items-center gap-2">
                  {item.archived ? <span className="text-xs text-amber-700">보관됨</span> : null}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  if (!isValidContentId(documentId)) notFound();
  const view = await getDocumentReadView(documentId);
  if (view.configured && !view.document) notFound();
  if (!view.configured || !view.document) {
    return (
      <main className="min-h-screen bg-[#f7f7f4] px-5 py-8 sm:px-8">
        <p className="mx-auto max-w-5xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">데이터베이스 연결을 먼저 설정해 주세요.</p>
      </main>
    );
  }

  const {
    document,
    path,
    archived,
    children,
    moveDestinations,
    references,
    backlinks,
    tags,
    availableTags,
  } = view;
  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-6 text-neutral-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-7">
        <nav aria-label="문서 경로" className="flex flex-wrap items-center gap-1 text-sm text-neutral-500">
          <Link href="/" className="hover:text-emerald-700">문서</Link>
          {path.length > 2 ? (
            <span className="inline-flex items-center gap-1 sm:hidden">
              <ChevronRight size={14} aria-hidden="true" />
              <span aria-label="중간 경로 생략">…</span>
            </span>
          ) : null}
          {path.map((node, index) => {
            const hiddenOnMobile = path.length > 2 && index < path.length - 2;
            return (
              <span key={node.id} className={`${hiddenOnMobile ? "hidden sm:inline-flex" : "inline-flex"} min-w-0 items-center gap-1`}>
                <ChevronRight size={14} aria-hidden="true" />
                {index === path.length - 1 ? (
                  <span aria-current="page" className="max-w-36 truncate text-neutral-950 sm:max-w-56">{node.title}</span>
                ) : (
                  <Link href={`/documents/${node.id}`} className="max-w-36 truncate hover:text-emerald-700 sm:max-w-56">{node.title}</Link>
                )}
              </span>
            );
          })}
        </nav>

        <DocumentEditor
          key={document.updatedAt.toISOString()}
          document={{
            id: document.id,
            title: document.title,
            content: document.content,
            accentColor: document.accentColor,
            updatedAt: dateFormatter.format(document.updatedAt),
            parentId: document.parentId,
            nodeType: document.nodeType,
          }}
          moveDestinations={moveDestinations}
          tags={tags}
          archived={archived}
        />

        {archived ? (
          <p className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">보관된 문서입니다. 상위 문서가 보관된 경우에도 이 문서는 읽을 수 있습니다.</p>
        ) : null}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-6">
            <ChildDocumentSection
              parentId={document.id}
              archived={archived}
              items={children.map((child) => ({
                id: child.id,
                title: child.title,
                updatedAt: dateFormatter.format(child.updatedAt),
                archived: archived || child.archivedAt !== null,
                childCount: child.childCount,
                nodeType: child.nodeType,
                tags: child.tags,
              }))}
            />
          </div>

          <div className="flex flex-col gap-4">
            <DocumentTagManager
              documentId={document.id}
              assignedTags={tags}
              availableTags={availableTags}
              archived={archived}
            />
            <RelatedDocuments title="참조하는 문서" items={references} />
            <RelatedDocuments title="이 문서를 참조하는 문서" items={backlinks} />
          </div>
        </div>
      </div>
    </main>
  );
}
