import {
  TOPIC_COLORS,
  TOPIC_DESCRIPTION_MAX_LENGTH,
  TOPIC_NAME_MAX_LENGTH,
  type ContentFieldErrors,
} from "@/features/content/model";

export function TopicFields({
  idPrefix,
  errors,
  values,
}: {
  idPrefix: string;
  errors?: ContentFieldErrors;
  values?: { name: string; description: string | null; color: string };
}) {
  const id = (name: string) => `${idPrefix}-${name}`;

  return (
    <>
      <div>
        <label htmlFor={id("name")} className="text-sm font-medium">
          주제 이름
        </label>
        <input
          id={id("name")}
          name="name"
          required
          maxLength={TOPIC_NAME_MAX_LENGTH}
          defaultValue={values?.name}
          placeholder="예: 웹 개발"
          aria-invalid={Boolean(errors?.name)}
          aria-describedby={errors?.name ? id("name-error") : undefined}
          className="mt-2 h-11 w-full border border-neutral-300 px-3 text-sm outline-none focus:border-emerald-700 aria-invalid:border-red-500"
        />
        {errors?.name ? (
          <p id={id("name-error")} className="mt-1 text-xs text-red-700">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={id("description")} className="text-sm font-medium">
          설명
        </label>
        <textarea
          id={id("description")}
          name="description"
          rows={3}
          maxLength={TOPIC_DESCRIPTION_MAX_LENGTH}
          defaultValue={values?.description ?? undefined}
          placeholder="이 주제에 어떤 기록을 모을지 적어 주세요."
          aria-invalid={Boolean(errors?.description)}
          aria-describedby={
            errors?.description ? id("description-error") : undefined
          }
          className="mt-2 w-full resize-none border border-neutral-300 px-3 py-2 text-sm leading-6 outline-none focus:border-emerald-700 aria-invalid:border-red-500"
        />
        {errors?.description ? (
          <p id={id("description-error")} className="mt-1 text-xs text-red-700">
            {errors.description}
          </p>
        ) : null}
      </div>

      <fieldset>
        <legend className="text-sm font-medium">색상</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {TOPIC_COLORS.map((color, index) => (
            <label key={color} className="cursor-pointer">
              <input
                type="radio"
                name="color"
                value={color}
                defaultChecked={values ? values.color === color : index === 0}
                className="peer sr-only"
              />
              <span
                className="block size-8 border-2 border-white ring-1 ring-neutral-300 peer-checked:ring-2 peer-checked:ring-neutral-950"
                style={{ backgroundColor: color }}
              />
              <span className="sr-only">{color}</span>
            </label>
          ))}
        </div>
        {errors?.color ? (
          <p className="mt-1 text-xs text-red-700">{errors.color}</p>
        ) : null}
      </fieldset>
    </>
  );
}
