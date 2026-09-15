import Link from "next/link";
import { Archive, ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getTopicWithDocuments } from "@/features/content/repository";
import { isValidContentId } from "@/features/content/validation";
import { DocumentItem } from "../../../document-item";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default async function DocumentArchivePage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  if (!isValidContentId(topicId)) notFound();
  const { configured, topic, items } = await getTopicWithDocuments(topicId, true);
  if (configured && !topic) notFound();

  if (!configured || !topic) {
    return <main className="p-8 text-sm">데이터베이스 연결을 먼저 설정해 주세요.</main>;
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex items-end justify-between border-b border-neutral-200 pb-6">
          <div>
            <p className="text-sm text-neutral-500">{topic.name}</p>
            <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold"><Archive size={28} /> 문서 보관함</h1>
          </div>
          <Link href={`/topics/${topic.id}`} className="inline-flex h-10 items-center gap-1.5 border border-neutral-300 bg-white px-3 text-sm"><ChevronLeft size={16} /> 문서로 돌아가기</Link>
        </header>
        <section className="border border-neutral-200 bg-white">
          {items.length === 0 ? <p className="p-12 text-center text-sm text-neutral-500">보관된 문서가 없습니다.</p> : items.map((document) => (
            <DocumentItem
              key={document.id}
              topicId={topic.id}
              archived
              document={{ id: document.id, title: document.title, content: document.content, updatedAt: dateFormatter.format(document.updatedAt) }}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
