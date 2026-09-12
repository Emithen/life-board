import Link from "next/link";
import { Archive, ChevronLeft } from "lucide-react";
import { listArchivedTodos } from "@/features/todos/repository";
import { TodoRestoreForm } from "../../todo-item-actions";
import { TodoMetadata } from "../../todo-metadata";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const { configured, items } = await listArchivedTodos();

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-6 text-neutral-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-5 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Lifeboard</p>
            <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold sm:text-4xl">
              <Archive size={30} aria-hidden="true" />
              보관함
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              보관된 Todo {items.length}개
            </p>
          </div>
          <Link
            href="/todos"
            className="inline-flex h-10 items-center gap-1.5 border border-neutral-300 bg-white px-3 text-sm text-neutral-700 hover:border-neutral-950 hover:text-neutral-950"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            오늘 할 일
          </Link>
        </header>

        {!configured ? (
          <section className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <strong>DB 연결 대기 중.</strong> 데이터베이스를 연결하면 보관된
            Todo를 확인할 수 있습니다.
          </section>
        ) : null}

        <section className="flex flex-col border border-neutral-200 bg-white">
          {items.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center px-5 py-12 text-center text-sm text-neutral-500">
              보관된 Todo가 없습니다.
            </div>
          ) : (
            items.map((todo) => (
              <article
                key={todo.id}
                className="grid gap-4 border-b border-neutral-100 p-5 last:border-b-0 sm:grid-cols-[1fr_auto]"
              >
                <div className="min-w-0">
                  <h2 className="break-words text-base font-medium">
                    {todo.title}
                  </h2>
                  {todo.notes ? (
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-600">
                      {todo.notes}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <TodoMetadata
                      priority={todo.priority}
                      dueDate={todo.dueDate}
                    />
                  </div>
                </div>
                <div className="flex items-start sm:justify-end">
                  <TodoRestoreForm id={todo.id} />
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
