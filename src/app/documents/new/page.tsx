import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { isDatabaseConfigured } from "@/db";
import { NewDocumentForm } from "../../new-document-form";

export default function NewDocumentPage() {
  const configured = isDatabaseConfigured();

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-6 text-neutral-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
        <header className="border-b border-neutral-200 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-950"
          >
            <ChevronLeft size={16} aria-hidden="true" /> 문서
          </Link>
          <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">새 문서</h1>
          <p className="mt-2 text-sm text-neutral-500">
            제목과 본문을 작성하세요. 만든 뒤 문서 안에서 하위 문서를 이어갈 수 있습니다.
          </p>
        </header>

        {!configured ? (
          <p className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            데이터베이스 연결을 먼저 설정해 주세요.
          </p>
        ) : null}

        <NewDocumentForm configured={configured} />
      </div>
    </main>
  );
}
