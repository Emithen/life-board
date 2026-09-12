import Link from "next/link";
import { Archive, ChevronLeft } from "lucide-react";
import { listTopics } from "@/features/content/repository";
import { TopicRestoreForm } from "../../topic-controls";

export const dynamic = "force-dynamic";

export default async function TopicArchivePage() {
  const { configured, items } = await listTopics(true);
  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex items-end justify-between border-b border-neutral-200 pb-6">
          <div>
            <p className="text-sm font-medium text-emerald-700">Knowledge workspace</p>
            <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold"><Archive size={28} /> 주제 보관함</h1>
          </div>
          <Link href="/" className="inline-flex h-10 items-center gap-1.5 border border-neutral-300 bg-white px-3 text-sm"><ChevronLeft size={16} /> 주제</Link>
        </header>
        {!configured ? <p className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">데이터베이스 연결을 먼저 설정해 주세요.</p> : null}
        <section className="border border-neutral-200 bg-white">
          {items.length === 0 ? <p className="p-12 text-center text-sm text-neutral-500">보관된 주제가 없습니다.</p> : items.map((topic) => (
            <article key={topic.id} className="flex items-start justify-between gap-4 border-b border-neutral-100 p-5 last:border-0">
              <div><div className="mb-3 h-1.5 w-10" style={{ backgroundColor: topic.color }} /><h2 className="font-medium">{topic.name}</h2><p className="mt-1 text-sm text-neutral-500">{topic.description}</p></div>
              <TopicRestoreForm id={topic.id} />
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
