export type DocumentNode = {
  id: string;
  parentId: string | null;
  title: string;
  archivedAt: Date | null;
  updatedAt: Date;
  accentColor: string | null;
  legacyTopicId: string | null;
};

export function getDocumentPath(
  byId: Map<string, DocumentNode>,
  id: string,
): DocumentNode[] | null {
  const path: DocumentNode[] = [];
  const seen = new Set<string>();
  let current = byId.get(id);

  while (current) {
    if (seen.has(current.id)) return null;
    seen.add(current.id);
    path.push(current);
    if (!current.parentId) return path.reverse();
    current = byId.get(current.parentId);
  }

  return null;
}

export function isArchivedPath(path: DocumentNode[]) {
  return path.some((node) => node.archivedAt !== null);
}

export function summarizeRootDocuments(nodes: DocumentNode[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const summaries = new Map<
    string,
    {
      root: DocumentNode;
      descendantCount: number;
      latestActivityAt: Date;
      latestDocument: DocumentNode | null;
    }
  >();

  for (const node of nodes) {
    if (node.parentId === null && node.archivedAt === null) {
      summaries.set(node.id, {
        root: node,
        descendantCount: 0,
        latestActivityAt: node.updatedAt,
        latestDocument: null,
      });
    }
  }

  for (const node of nodes) {
    const path = getDocumentPath(byId, node.id);
    if (!path || isArchivedPath(path) || path.length === 1) continue;
    const summary = summaries.get(path[0].id);
    if (!summary) continue;
    summary.descendantCount += 1;
    if (node.updatedAt > summary.latestActivityAt) {
      summary.latestActivityAt = node.updatedAt;
    }
    if (!summary.latestDocument || node.updatedAt > summary.latestDocument.updatedAt) {
      summary.latestDocument = node;
    }
  }

  return [...summaries.values()].sort(
    (a, b) => b.latestActivityAt.getTime() - a.latestActivityAt.getTime(),
  );
}
