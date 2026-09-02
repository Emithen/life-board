import { asc, desc, ne } from "drizzle-orm";
import { Archive, CalendarDays, Check, Circle, Plus } from "lucide-react";
import { archiveTodo, createTodo, toggleTodo } from "./actions";
import { db, isDatabaseConfigured } from "@/db";
import { todos, type Todo } from "@/db/schema";

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
          <form
            action={createTodo}
            className="flex flex-col gap-4 border border-neutral-200 bg-white p-5"
          >
            <div>
              <label htmlFor="title" className="text-sm font-medium">
                새 todo
              </label>
              <input
                id="title"
                name="title"
                required
                placeholder="해야 할 일을 입력"
                className="mt-2 h-11 w-full border border-neutral-300 px-3 text-sm outline-none focus:border-emerald-700"
              />
            </div>
            <div>
              <label htmlFor="notes" className="text-sm font-medium">
                메모
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                placeholder="상세 내용"
                className="mt-2 w-full resize-none border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="dueDate" className="text-sm font-medium">
                  마감일
                </label>
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  className="mt-2 h-11 w-full border border-neutral-300 px-3 text-sm outline-none focus:border-emerald-700"
                />
              </div>
              <div>
                <label htmlFor="priority" className="text-sm font-medium">
                  우선순위
                </label>
                <select
                  id="priority"
                  name="priority"
                  defaultValue="2"
                  className="mt-2 h-11 w-full border border-neutral-300 px-3 text-sm outline-none focus:border-emerald-700"
                >
                  <option value="1">High</option>
                  <option value="2">Normal</option>
                  <option value="3">Low</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={!configured}
              className="inline-flex h-11 items-center justify-center gap-2 bg-neutral-950 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              <Plus size={17} aria-hidden="true" />
              추가
            </button>
          </form>

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
                      <form
                        action={toggleTodo.bind(
                          null,
                          todo.id,
                          todo.status === "completed" ? "active" : "completed",
                        )}
                      >
                        <button
                          type="submit"
                          title={
                            todo.status === "completed"
                              ? "미완료로 변경"
                              : "완료로 변경"
                          }
                          className="mt-0.5 inline-flex size-6 items-center justify-center border border-neutral-300 text-emerald-700"
                        >
                          {todo.status === "completed" ? (
                            <Check size={15} aria-hidden="true" />
                          ) : (
                            <Circle size={14} aria-hidden="true" />
                          )}
                        </button>
                      </form>
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
                    <form action={archiveTodo.bind(null, todo.id)}>
                      <button
                        type="submit"
                        title="보관"
                        className="inline-flex size-8 items-center justify-center border border-neutral-200 text-neutral-500 hover:text-neutral-950"
                      >
                        <Archive size={15} aria-hidden="true" />
                      </button>
                    </form>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
