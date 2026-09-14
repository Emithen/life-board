import Link from "next/link";
import { Archive, ChevronLeft, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { getTopicWithDocuments } from "@/features/content/repository";
import { isValidContentId } from "@/features/content/validation";
import { DocumentForm } from "../../../document-form";
import { DocumentItem } from "../../../document-item";
import {
  TopicArchiveForm,
  TopicEditForm,
  TopicRestoreForm,
} from "../../../topic-controls";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  if (!isValidContentId(topicId)) notFound();
  const { configured, topic, items } = await getTopicWithDocuments(topicId);
  if (configured && !topic) notFound();

  if (!configured || !topic) {
    return (
      <main className="min-h-screen bg-[#f7f7f4] px-5 py-8 sm:px-8">
        <p className="mx-auto max-w-4xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">데이터베이스 연결을 먼저 설정해 주세요.</p>
      </main>
    );
  }

  const archived = Boolean(topic.archivedAt);
  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="border-b border-neutral-200 pb-6">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-950"><ChevronLeft size={16} /> 주제</Link>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 h-1.5 w-12" style={{ backgroundColor: topic.color }} />
              <h1 className="text-3xl font-semibold sm:text-4xl">{topic.name}</h1>
              {topic.description ? <p className="mt-2 text-sm text-neutral-600">{topic.description}</p> : null}
              <p className="mt-3 text-xs text-neutral-400">문서 {items.length}개 · {dateFormatter.format(topic.updatedAt)} 활동</p>
            </div>
            <div className="flex items-center gap-2">
              {!archived ? <Link href={`/topics/${topic.id}/archive`} className="inline-flex h-9 items-center gap-1.5 border border-neutral-300 bg-white px-3 text-sm"><Archive size={15} /> 문서 보관함</Link> : null}
              {archived ? <TopicRestoreForm id={topic.id} /> : <TopicArchiveForm id={topic.id} />}
            </div>
          </div>
          {!archived ? <TopicEditForm key={topic.updatedAt.toISOString()} topic={topic} /> : null}
        </header>

        {archived ? (
          <section className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">보관된 주제입니다. 문서는 그대로 유지되며, 주제를 복원하면 다시 작성할 수 있습니다.</section>
        ) : (
          <section className="grid items-start gap-6 lg:grid-cols-[360px_1fr]">
            <DocumentForm topicId={topic.id} />
            <div className="border border-neutral-200 bg-white">
              {items.length === 0 ? (
                <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center text-neutral-500"><FileText size={28} /><p className="mt-3 text-sm">아직 문서가 없습니다. 첫 메모를 남겨 보세요.</p></div>
              ) : items.map((document) => (
                <DocumentItem
                  key={`${document.id}-${document.updatedAt.toISOString()}`}
                  topicId={topic.id}
                  document={{
                    id: document.id,
                    title: document.title,
                    content: document.content,
                    updatedAt: dateFormatter.format(document.updatedAt),
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
