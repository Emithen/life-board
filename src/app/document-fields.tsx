import {
  DOCUMENT_CONTENT_MAX_LENGTH,
  DOCUMENT_TITLE_MAX_LENGTH,
  type ContentFieldErrors,
} from "@/features/content/model";

export function DocumentFields({
  idPrefix,
  errors,
  values,
}: {
  idPrefix: string;
  errors?: ContentFieldErrors;
  values?: { title: string; content: string | null };
}) {
  const titleErrorId = `${idPrefix}-title-error`;
  const contentErrorId = `${idPrefix}-content-error`;
  return (
    <>
      <div>
        <label htmlFor={`${idPrefix}-title`} className="text-sm font-medium">제목</label>
        <input
          id={`${idPrefix}-title`}
          name="title"
          required
          maxLength={DOCUMENT_TITLE_MAX_LENGTH}
          defaultValue={values?.title}
          placeholder="예: Next.js 생태계 및 문법"
          aria-invalid={Boolean(errors?.title)}
          aria-describedby={errors?.title ? titleErrorId : undefined}
          className="mt-2 h-11 w-full border border-neutral-300 px-3 text-sm outline-none focus:border-emerald-700 aria-invalid:border-red-500"
        />
        {errors?.title ? <p id={titleErrorId} className="mt-1 text-xs text-red-700">{errors.title}</p> : null}
      </div>
      <div>
        <label htmlFor={`${idPrefix}-content`} className="text-sm font-medium">본문</label>
        <textarea
          id={`${idPrefix}-content`}
          name="content"
          rows={values ? 6 : 8}
          maxLength={DOCUMENT_CONTENT_MAX_LENGTH}
          defaultValue={values?.content ?? undefined}
          placeholder={"간단한 Markdown 메모를 남겨 보세요.\n\n- drizzle ORM\n- server action"}
          aria-invalid={Boolean(errors?.content)}
          aria-describedby={errors?.content ? contentErrorId : undefined}
          className="mt-2 w-full resize-y border border-neutral-300 px-3 py-2 font-mono text-sm leading-6 outline-none focus:border-emerald-700 aria-invalid:border-red-500"
        />
        {errors?.content ? <p id={contentErrorId} className="mt-1 text-xs text-red-700">{errors.content}</p> : null}
      </div>
    </>
  );
}
