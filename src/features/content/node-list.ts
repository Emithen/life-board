import type { NodeType } from "./model";

export type NodeListFilter = "all" | NodeType;
export type NodeListSort = "updated-desc" | "title-asc" | "type";

type NodeListItem = {
  id: string;
  title: string;
  nodeType: NodeType;
  updatedAtValue: number;
};

const nodeTypeOrder: Record<NodeType, number> = {
  structure: 0,
  concept: 1,
  reference: 2,
};

export function filterAndSortNodes<T extends NodeListItem>(
  items: T[],
  filter: NodeListFilter,
  sort: NodeListSort,
) {
  const filtered = filter === "all"
    ? items
    : items.filter((item) => item.nodeType === filter);

  return [...filtered].sort((a, b) => {
    if (sort === "title-asc") {
      return a.title.localeCompare(b.title, "ko");
    }
    if (sort === "type") {
      return (
        nodeTypeOrder[a.nodeType] - nodeTypeOrder[b.nodeType] ||
        a.title.localeCompare(b.title, "ko")
      );
    }
    return b.updatedAtValue - a.updatedAtValue;
  });
}

