import Link from "next/link";
import { ArrowUpRight, ChevronRight, FileText, Link2 } from "lucide-react";
import { notFound } from "next/navigation";
import { getDocumentReadView } from "@/features/content/read-repository";
import { isValidContentId } from "@/features/content/validation";

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

  const { document, path, archived, children, references, backlinks } = view;
  const legacyTopicId = document.legacyTopicId ?? document.topicId;

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-6 text-neutral-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-7">
        <nav aria-label="문서 경로" className="flex flex-wrap items-center gap-1 text-sm text-neutral-500">
          <Link href="/" className="hover:text-emerald-700">문서</Link>
          {path.map((node, index) => (
            <span key={node.id} className="inline-flex min-w-0 items-center gap-1">
              <ChevronRight size={14} aria-hidden="true" />
              {index === path.length - 1 ? (
                <span aria-current="page" className="max-w-56 truncate text-neutral-950">{node.title}</span>
              ) : (
                <Link href={`/documents/${node.id}`} className="max-w-56 truncate hover:text-emerald-700">{node.title}</Link>
              )}
            </span>
          ))}
        </nav>

        <header className="border-b border-neutral-200 pb-6">
          {document.accentColor ? <div className="mb-4 h-1.5 w-12" style={{ backgroundColor: document.accentColor }} /> : null}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="break-words text-3xl font-semibold sm:text-4xl">{document.title}</h1>
              <p className="mt-3 text-xs text-neutral-500">{dateFormatter.format(document.updatedAt)} 수정</p>
            </div>
            {legacyTopicId && !archived ? (
              <Link href={`/topics/manage/${legacyTopicId}`} className="inline-flex h-10 items-center border border-neutral-300 bg-white px-3 text-sm hover:border-neutral-950">문서 관리</Link>
            ) : null}
          </div>
        </header>

        {archived ? (
          <p className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">보관된 문서입니다. 상위 문서가 보관된 경우에도 이 문서는 읽을 수 있습니다.</p>
        ) : null}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-6">
            <section aria-label="문서 본문" className="min-h-44 border border-neutral-200 bg-white p-6">
              {document.content ? (
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-neutral-700">{document.content}</p>
              ) : (
                <p className="text-sm text-neutral-400">아직 작성된 본문이 없습니다.</p>
              )}
            </section>

            <section className="border border-neutral-200 bg-white">
              <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
                <h2 className="flex items-center gap-2 font-semibold"><FileText size={17} aria-hidden="true" /> 하위 문서</h2>
                <span className="text-sm text-neutral-400">{children.length}개</span>
              </div>
              {children.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-neutral-500">하위 문서가 없습니다.</p>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {children.map((child) => (
                    <li key={child.id}>
                      <Link href={`/documents/${child.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-neutral-50">
                        <span className="min-w-0 break-words font-medium">{child.title}</span>
                        <span className="flex shrink-0 items-center gap-3 text-xs text-neutral-500">
                          {archived || child.archivedAt ? <span className="text-amber-700">보관됨</span> : null}
                          {dateFormatter.format(child.updatedAt)}
                          <ArrowUpRight size={16} aria-hidden="true" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="flex flex-col gap-4">
            <RelatedDocuments title="참조하는 문서" items={references} />
            <RelatedDocuments title="이 문서를 참조하는 문서" items={backlinks} />
          </div>
        </div>
      </div>
    </main>
  );
}
