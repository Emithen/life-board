import type { NodeType } from "./model";

export type DocumentNode = {
  id: string;
  parentId: string | null;
  nodeType: NodeType;
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

export type DocumentMoveDestination = {
  id: string;
  title: string;
  pathLabel: string;
};

export function listDocumentMoveDestinations(
  nodes: DocumentNode[],
  documentId: string,
): DocumentMoveDestination[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const sourcePath = getDocumentPath(byId, documentId);
  if (!sourcePath || isArchivedPath(sourcePath)) return [];

  return nodes
    .flatMap((node) => {
      const path = getDocumentPath(byId, node.id);
      if (
        !path ||
        isArchivedPath(path) ||
        path.some((pathNode) => pathNode.id === documentId)
      ) {
        return [];
      }
      return [{
        id: node.id,
        title: node.title,
        pathLabel: path.map((pathNode) => pathNode.title).join(" / "),
      }];
    })
    .sort((a, b) => a.pathLabel.localeCompare(b.pathLabel, "ko"));
}

export function canMoveDocument(
  nodes: DocumentNode[],
  documentId: string,
  parentId: string | null,
) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const sourcePath = getDocumentPath(byId, documentId);
  if (!sourcePath || isArchivedPath(sourcePath)) return false;
  if (parentId === null) return true;
  return listDocumentMoveDestinations(nodes, documentId).some(
    (destination) => destination.id === parentId,
  );
}

export function countActiveDirectChildren(nodes: DocumentNode[]) {
  const counts = new Map<string, number>();

  for (const node of nodes) {
    if (!node.parentId || node.archivedAt !== null) continue;
    counts.set(node.parentId, (counts.get(node.parentId) ?? 0) + 1);
  }

  return counts;
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
