import Link from "next/link";
import { Archive, FileText, LibraryBig } from "lucide-react";
import { listTopics } from "@/features/content/repository";
import { TopicForm } from "../../topic-form";
import { TopicArchiveForm, TopicEditForm } from "../../topic-controls";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default async function TopicsPage() {
  const { configured, items } = await listTopics();

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-6 text-neutral-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-5 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Knowledge workspace</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">문서 관리</h1>
            <p className="mt-2 text-sm text-neutral-500">새 문서를 만들거나 기존 문서를 관리하세요.</p>
          </div>
          <Link href="/topics/archive" className="inline-flex h-10 items-center gap-1.5 border border-neutral-300 bg-white px-3 text-sm text-neutral-700 hover:border-neutral-950 hover:text-neutral-950">
            <Archive size={16} aria-hidden="true" /> 문서 보관함
          </Link>
        </header>

        {!configured ? (
          <section className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <strong>DB 연결 대기 중.</strong> 마이그레이션을 적용하면 문서 저장이 활성화됩니다.
          </section>
        ) : null}

        <section className="grid items-start gap-6 lg:grid-cols-[340px_1fr]">
          <TopicForm configured={configured} />
          <div>
            {items.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center border border-neutral-200 bg-white px-5 text-center text-neutral-500">
                <LibraryBig size={28} aria-hidden="true" />
                <p className="mt-3 text-sm">아직 문서가 없습니다. 첫 문서를 만들어 보세요.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((topic) => (
                  <article key={topic.id} className="border border-neutral-200 bg-white p-5">
                    <div className="h-1.5 w-12" style={{ backgroundColor: topic.color }} />
                    <Link href={`/topics/manage/${topic.id}`} className="group mt-4 block">
                      <h2 className="text-xl font-semibold group-hover:text-emerald-700">{topic.name}</h2>
                      <p className="mt-2 min-h-10 text-sm leading-5 text-neutral-600">{topic.description ?? "설명이 없습니다."}</p>
                    </Link>
                    <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4 text-xs text-neutral-500">
                      <span className="inline-flex items-center gap-1"><FileText size={14} /> 문서 {topic.documentCount}개</span>
                      <span>{dateFormatter.format(topic.updatedAt)} 활동</span>
                    </div>
                    <p className="mt-2 truncate text-xs text-neutral-500">
                      {topic.latestDocument ? `최근: ${topic.latestDocument.title}` : "아직 작성한 문서가 없습니다."}
                    </p>
                    <div className="mt-4 flex items-start justify-between gap-2">
                      <TopicEditForm key={topic.updatedAt.toISOString()} topic={topic} />
                      <TopicArchiveForm id={topic.id} />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
