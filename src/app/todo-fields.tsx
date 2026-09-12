import {
  TODO_NOTES_MAX_LENGTH,
  TODO_PRIORITIES,
  TODO_TITLE_MAX_LENGTH,
  type TodoFieldErrors,
  type TodoPriority,
} from "@/features/todos/model";

type TodoFieldValues = {
  title?: string;
  notes?: string | null;
  dueDate?: string | null;
  priority?: TodoPriority | number;
};

export function TodoFields({
  idPrefix,
  errors,
  values = {},
  compact = false,
}: {
  idPrefix: string;
  errors?: TodoFieldErrors;
  values?: TodoFieldValues;
  compact?: boolean;
}) {
  const fieldId = (name: string) => `${idPrefix}-${name}`;
  const inputHeight = compact ? "h-10" : "h-11";

  return (
    <>
      <div>
        <label htmlFor={fieldId("title")} className="text-sm font-medium">
          {compact ? "할 일" : "새 todo"}
        </label>
        <input
          id={fieldId("title")}
          name="title"
          required
          maxLength={TODO_TITLE_MAX_LENGTH}
          defaultValue={values.title}
          aria-invalid={Boolean(errors?.title)}
          aria-describedby={errors?.title ? fieldId("title-error") : undefined}
          placeholder={compact ? undefined : "해야 할 일을 입력"}
          className={`mt-2 w-full border border-neutral-300 px-3 text-sm outline-none focus:border-emerald-700 aria-invalid:border-red-500 ${inputHeight}`}
        />
        {errors?.title ? (
          <p id={fieldId("title-error")} className="mt-1 text-xs text-red-700">
            {errors.title}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={fieldId("notes")} className="text-sm font-medium">
          메모
        </label>
        <textarea
          id={fieldId("notes")}
          name="notes"
          rows={compact ? 3 : 4}
          maxLength={TODO_NOTES_MAX_LENGTH}
          defaultValue={values.notes ?? undefined}
          aria-invalid={Boolean(errors?.notes)}
          aria-describedby={errors?.notes ? fieldId("notes-error") : undefined}
          placeholder={compact ? undefined : "상세 내용"}
          className="mt-2 w-full resize-none border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 aria-invalid:border-red-500"
        />
        {errors?.notes ? (
          <p id={fieldId("notes-error")} className="mt-1 text-xs text-red-700">
            {errors.notes}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={fieldId("due-date")} className="text-sm font-medium">
            마감일
          </label>
          <input
            id={fieldId("due-date")}
            name="dueDate"
            type="date"
            defaultValue={values.dueDate ?? undefined}
            aria-invalid={Boolean(errors?.dueDate)}
            aria-describedby={
              errors?.dueDate ? fieldId("due-date-error") : undefined
            }
            className={`mt-2 w-full border border-neutral-300 px-3 text-sm outline-none focus:border-emerald-700 aria-invalid:border-red-500 ${inputHeight}`}
          />
          {errors?.dueDate ? (
            <p
              id={fieldId("due-date-error")}
              className="mt-1 text-xs text-red-700"
            >
              {errors.dueDate}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={fieldId("priority")} className="text-sm font-medium">
            우선순위
          </label>
          <select
            id={fieldId("priority")}
            name="priority"
            defaultValue={String(values.priority ?? 2)}
            aria-invalid={Boolean(errors?.priority)}
            aria-describedby={
              errors?.priority ? fieldId("priority-error") : undefined
            }
            className={`mt-2 w-full border border-neutral-300 px-3 text-sm outline-none focus:border-emerald-700 aria-invalid:border-red-500 ${inputHeight}`}
          >
            {TODO_PRIORITIES.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
          {errors?.priority ? (
            <p
              id={fieldId("priority-error")}
              className="mt-1 text-xs text-red-700"
            >
              {errors.priority}
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
