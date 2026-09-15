"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FilePlus2, LoaderCircle, X } from "lucide-react";
import { initialContentActionState } from "@/features/content/model";
import { createRootDocument } from "./content-actions";
import { DocumentFields } from "./document-fields";

export function NewDocumentForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(
    createRootDocument,
    initialContentActionState,
  );

  return (
    <form
      action={action}
      aria-busy={pending}
      className="grid gap-5 border border-neutral-200 bg-white p-5 sm:p-6"
    >
      <DocumentFields idPrefix="create-document" errors={state.fieldErrors} />
      {state.message ? (
        <p aria-live="polite" className="text-sm text-red-700">
          {state.message}
        </p>
      ) : null}
      <div className="flex flex-wrap justify-end gap-2">
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-2 border border-neutral-200 px-3 text-sm"
        >
          <X size={15} aria-hidden="true" /> 취소
        </Link>
        <button
          type="submit"
          disabled={!configured || pending}
          className="inline-flex h-10 items-center gap-2 bg-neutral-950 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {pending ? (
            <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
          ) : (
            <FilePlus2 size={15} aria-hidden="true" />
          )}
          {pending ? "만드는 중..." : "문서 만들기"}
        </button>
      </div>
    </form>
  );
}
