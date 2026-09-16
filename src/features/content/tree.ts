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

export type ReferenceTarget = DocumentMoveDestination & {
  nodeType: Exclude<NodeType, "reference">;
};

export function listReferenceTargets(
  nodes: DocumentNode[],
  sourceParentId: string,
): ReferenceTarget[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const sourcePath = getDocumentPath(byId, sourceParentId);
  if (
    !sourcePath ||
    isArchivedPath(sourcePath) ||
    sourcePath.at(-1)?.nodeType !== "structure"
  ) {
    return [];
  }

  const visibleConceptParentIds = new Set(sourcePath.map((node) => node.id));

  return nodes
    .flatMap((node) => {
      if (node.id === sourceParentId || node.nodeType === "reference") return [];
      const path = getDocumentPath(byId, node.id);
      if (!path || isArchivedPath(path)) return [];

      const conceptIsVisible =
        node.nodeType !== "concept" ||
        node.parentId === null ||
        visibleConceptParentIds.has(node.parentId);
      if (!conceptIsVisible) return [];

      return [{
        id: node.id,
        title: node.title,
        pathLabel: path.map((pathNode) => pathNode.title).join(" / "),
        nodeType: node.nodeType,
      }];
    })
    .sort((a, b) => a.pathLabel.localeCompare(b.pathLabel, "ko"));
}

export function listReferenceMoveDestinations(
  nodes: DocumentNode[],
  referenceDocumentId: string,
  targetDocumentId: string,
) {
  const referenceDocument = nodes.find(
    (node) => node.id === referenceDocumentId,
  );
  if (referenceDocument?.nodeType !== "reference") return [];

  return listDocumentMoveDestinations(nodes, referenceDocumentId).filter(
    (destination) =>
      listReferenceTargets(nodes, destination.id).some(
        (target) => target.id === targetDocumentId,
      ),
  );
}

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
        node.nodeType !== "structure" ||
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
