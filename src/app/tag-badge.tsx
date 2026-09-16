import type { TagColor } from "@/features/content/model";

const colorClasses: Record<TagColor, string> = {
  gray: "border-neutral-200 bg-neutral-100 text-neutral-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  red: "border-red-200 bg-red-50 text-red-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
};

export type DocumentTag = {
  id: string;
  name: string;
  color: TagColor;
};

export function TagBadge({ tag }: { tag: DocumentTag }) {
  return (
    <span
      className={`inline-flex max-w-32 items-center truncate rounded-full border px-2 py-0.5 text-xs font-medium ${colorClasses[tag.color]}`}
      title={tag.name}
    >
      {tag.name}
    </span>
  );
}
