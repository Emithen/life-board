import { notFound, redirect } from "next/navigation";
import { getLegacyRootDocumentId } from "@/features/content/read-repository";
import { isValidContentId } from "@/features/content/validation";

export const dynamic = "force-dynamic";

export default async function LegacyTopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  if (!isValidContentId(topicId)) notFound();
  const { configured, id } = await getLegacyRootDocumentId(topicId);
  if (!configured) {
    return (
      <main className="min-h-screen bg-[#f7f7f4] px-5 py-8 sm:px-8">
        <p className="mx-auto max-w-4xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">데이터베이스 연결을 먼저 설정해 주세요.</p>
      </main>
    );
  }
  if (!id) notFound();
  redirect(`/documents/${id}`);
}
