import Link from "next/link";
import { CheckSquare2, LibraryBig } from "lucide-react";

export function AppNav() {
  return (
    <nav className="border-b border-neutral-200 bg-white px-5 sm:px-8 lg:px-12" aria-label="주요 메뉴">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">Lifeboard</Link>
        <div className="flex items-center gap-1 text-sm">
          <Link href="/" className="inline-flex h-9 items-center gap-1.5 px-3 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950">
            <LibraryBig size={16} aria-hidden="true" /> 문서
          </Link>
          <Link href="/todos" className="inline-flex h-9 items-center gap-1.5 px-3 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950">
            <CheckSquare2 size={16} aria-hidden="true" /> Todo
          </Link>
        </div>
      </div>
    </nav>
  );
}
