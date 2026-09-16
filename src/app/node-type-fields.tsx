import { NodeTypeBadge } from "./node-type-badge";

export function NodeTypeFields({
  idPrefix,
  error,
  defaultValue = "structure",
}: {
  idPrefix: string;
  error?: string;
  defaultValue?: "structure" | "concept";
}) {
  const errorId = `${idPrefix}-node-type-error`;

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="text-sm font-medium">유형</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <label className="cursor-pointer border border-neutral-300 p-3 has-checked:border-sky-600 has-checked:bg-sky-50/50">
          <span className="flex items-center gap-2">
            <input
              type="radio"
              name="nodeType"
              value="structure"
              defaultChecked={defaultValue === "structure"}
              className="accent-sky-700"
            />
            <NodeTypeBadge nodeType="structure" />
          </span>
          <span className="mt-2 block text-xs leading-5 text-neutral-500">
            다른 구조와 개념 노드를 담을 수 있습니다.
          </span>
        </label>
        <label className="cursor-pointer border border-neutral-300 p-3 has-checked:border-amber-600 has-checked:bg-amber-50/50">
          <span className="flex items-center gap-2">
            <input
              type="radio"
              name="nodeType"
              value="concept"
              defaultChecked={defaultValue === "concept"}
              className="accent-amber-700"
            />
            <NodeTypeBadge nodeType="concept" />
          </span>
          <span className="mt-2 block text-xs leading-5 text-neutral-500">
            재사용할 독립 개념이며 하위 노드를 가질 수 없습니다.
          </span>
        </label>
      </div>
      {error ? <p id={errorId} className="mt-1 text-xs text-red-700">{error}</p> : null}
    </fieldset>
  );
}
