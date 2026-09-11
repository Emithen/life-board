import Link from "next/link";
import { asc, desc, ne } from "drizzle-orm";
import { Archive, CalendarDays } from "lucide-react";
import { db, isDatabaseConfigured } from "@/db";
import { todos, type Todo } from "@/db/schema";
import { TodoForm } from "./todo-form";
import { TodoEditForm } from "./todo-edit-form";
import { TodoArchiveForm, TodoToggleForm } from "./todo-item-actions";

export const dynamic = "force-dynamic";

async function getTodos() {
  if (!isDatabaseConfigured()) {
    return { configured: false, items: [] as Todo[] };
  }

  const items = await db()
    .select()
    .from(todos)
    .where(ne(todos.status, "archived"))
    .orderBy(asc(todos.status), asc(todos.dueDate), desc(todos.createdAt));

  return { configured: true, items };
}

function priorityLabel(priority: number) {
  if (priority === 1) return "High";
  if (priority === 3) return "Low";
  return "Normal";
}

export default async function Home() {
  const { configured, items } = await getTodos();
  const activeCount = items.filter((todo) => todo.status === "active").length;
  const completedCount = items.filter((todo) => todo.status === "completed").length;

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-6 text-neutral-950 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-5 border-b border-neutral-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Lifeboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal sm:text-4xl">
              오늘 할 일
            </h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Link
              href="/archive"
              className="inline-flex h-11 items-center justify-center gap-1.5 border border-neutral-300 bg-white px-3 text-sm text-neutral-700 hover:border-neutral-950 hover:text-neutral-950"
            >
              <Archive size={16} aria-hidden="true" />
              보관함
            </Link>
            <div className="grid grid-cols-2 gap-3 text-sm sm:flex">
              <div className="border border-neutral-200 bg-white px-4 py-3">
                <p className="text-neutral-500">Active</p>
                <p className="mt-1 text-2xl font-semibold">{activeCount}</p>
              </div>
              <div className="border border-neutral-200 bg-white px-4 py-3">
                <p className="text-neutral-500">Done</p>
                <p className="mt-1 text-2xl font-semibold">{completedCount}</p>
              </div>
            </div>
          </div>
        </header>

        {!configured ? (
          <section className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <strong>DB 연결 대기 중.</strong> Neon 연결 문자열을{" "}
            <code className="font-mono">.env.local</code>의{" "}
            <code className="font-mono">DATABASE_URL</code>에 넣고 migration을
            실행하면 todo 저장이 활성화됩니다.
          </section>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <TodoForm configured={configured} />

          <div className="flex flex-col border border-neutral-200 bg-white">
            {items.length === 0 ? (
              <div className="flex min-h-64 items-center justify-center px-5 py-12 text-center text-sm text-neutral-500">
                아직 todo가 없습니다.
              </div>
            ) : (
              items.map((todo) => (
                <article
                  key={todo.id}
                  className="grid gap-4 border-b border-neutral-100 p-5 last:border-b-0 sm:grid-cols-[1fr_auto]"
                >
                  <div className="min-w-0">
                    <div className="flex items-start gap-3">
                      <TodoToggleForm
                        id={todo.id}
                        completed={todo.status === "completed"}
                      />
                      <div className="min-w-0">
                        <h2
                          className={`break-words text-base font-medium ${
                            todo.status === "completed"
                              ? "text-neutral-400 line-through"
                              : "text-neutral-950"
                          }`}
                        >
                          {todo.title}
                        </h2>
                        {todo.notes ? (
                          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-600">
                            {todo.notes}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span className="border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600">
                      {priorityLabel(todo.priority)}
                    </span>
                    {todo.dueDate ? (
                      <span className="inline-flex items-center gap-1 border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600">
                        <CalendarDays size={13} aria-hidden="true" />
                        {todo.dueDate}
                      </span>
                    ) : null}
                    <TodoArchiveForm id={todo.id} />
                  </div>
                  <TodoEditForm
                    todo={{
                      id: todo.id,
                      title: todo.title,
                      notes: todo.notes,
                      dueDate: todo.dueDate,
                      priority: todo.priority,
                    }}
                  />
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
