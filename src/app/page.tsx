import Link from "next/link";
import { ArrowUpRight, FileText, FolderOpen, LibraryBig } from "lucide-react";
import { listRootDocuments } from "@/features/content/read-repository";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default async function DocumentsPage() {
  const { configured, items } = await listRootDocuments();

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-6 text-neutral-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-5 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Knowledge workspace</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">문서</h1>
            <p className="mt-2 text-sm text-neutral-500">문서를 열고, 그 안에 담긴 문서를 따라가 보세요.</p>
          </div>
          <Link href="/topics/manage" className="inline-flex h-10 items-center gap-2 border border-neutral-300 bg-white px-4 text-sm hover:border-neutral-950">
            <FolderOpen size={16} aria-hidden="true" /> 주제 관리
          </Link>
        </header>

        {!configured ? (
          <section className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <strong>DB 연결 대기 중.</strong> 연결 문자열과 마이그레이션을 설정하면 문서를 볼 수 있습니다.
          </section>
        ) : null}

        {items.length === 0 ? (
          <section className="flex min-h-72 flex-col items-center justify-center border border-neutral-200 bg-white px-5 text-center text-neutral-500">
            <LibraryBig size={30} aria-hidden="true" />
            <p className="mt-3 text-sm">아직 문서가 없습니다.</p>
            {configured ? <Link href="/topics/manage" className="mt-4 text-sm font-medium text-emerald-700 hover:underline">첫 문서 만들기</Link> : null}
          </section>
        ) : (
          <section aria-label="루트 문서" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(({ root, descendantCount, latestActivityAt, latestDocument }) => (
              <article key={root.id} className="flex flex-col border border-neutral-200 bg-white p-5">
                <div className="h-1.5 w-12 bg-emerald-700" style={root.accentColor ? { backgroundColor: root.accentColor } : undefined} />
                <Link href={`/documents/${root.id}`} className="group mt-4 flex items-start justify-between gap-3">
                  <h2 className="break-words text-xl font-semibold group-hover:text-emerald-700">{root.title}</h2>
                  <ArrowUpRight size={18} className="mt-1 shrink-0 text-neutral-400 group-hover:text-emerald-700" aria-hidden="true" />
                </Link>
                <p className="mt-3 min-h-8 text-xs text-neutral-500">
                  {latestDocument ? `최근 하위 문서: ${latestDocument.title}` : "아직 하위 문서가 없습니다."}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-4 text-xs text-neutral-500">
                  <span className="inline-flex items-center gap-1.5"><FileText size={14} aria-hidden="true" /> 하위 문서 {descendantCount}개</span>
                  <span>{dateFormatter.format(latestActivityAt)} 활동</span>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
