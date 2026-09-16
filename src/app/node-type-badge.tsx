import { ExternalLink, FolderTree, Lightbulb } from "lucide-react";
import type { ComponentType } from "react";
import type { NodeType } from "@/features/content/model";

const nodeTypePresentation: Record<
  NodeType,
  {
    label: string;
    Icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
    className: string;
  }
> = {
  structure: {
    label: "구조",
    Icon: FolderTree,
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  concept: {
    label: "개념",
    Icon: Lightbulb,
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  reference: {
    label: "참조",
    Icon: ExternalLink,
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
};

export function NodeTypeBadge({ nodeType }: { nodeType: NodeType }) {
  const { label, Icon, className } = nodeTypePresentation[nodeType];

  return (
    <span
      data-node-type={nodeType}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}
    >
      <Icon size={12} aria-hidden={true} />
      {label}
    </span>
  );
}

