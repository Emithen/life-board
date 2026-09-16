import "server-only";

import { eq, inArray, or } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import {
  documentReferences,
  documentTags,
  documents,
  tags,
} from "@/db/schema";
import type { TagColor } from "./model";
import {
  countActiveDirectChildren,
  getDocumentPath,
  isArchivedPath,
  listDocumentMoveDestinations,
  summarizeRootDocuments,
  type DocumentNode,
} from "./tree";

async function listDocumentNodes(): Promise<DocumentNode[]> {
  return db()
    .select({
      id: documents.id,
      parentId: documents.parentId,
      title: documents.title,
      archivedAt: documents.archivedAt,
      updatedAt: documents.updatedAt,
      accentColor: documents.accentColor,
      legacyTopicId: documents.legacyTopicId,
    })
    .from(documents);
}

type DocumentTagAssignment = {
  documentId: string;
  id: string;
  name: string;
  color: TagColor;
};

async function listDocumentTagAssignments(
  documentIds: string[],
): Promise<DocumentTagAssignment[]> {
  if (documentIds.length === 0) return [];
  return db()
    .select({
      documentId: documentTags.documentId,
      id: tags.id,
      name: tags.name,
      color: tags.color,
    })
    .from(documentTags)
    .innerJoin(tags, eq(documentTags.tagId, tags.id))
    .where(inArray(documentTags.documentId, documentIds))
    .orderBy(tags.name);
}

function groupTagsByDocument(assignments: DocumentTagAssignment[]) {
  const grouped = new Map<string, Omit<DocumentTagAssignment, "documentId">[]>();
  for (const { documentId, ...tag } of assignments) {
    const documentTagList = grouped.get(documentId);
    if (documentTagList) documentTagList.push(tag);
    else grouped.set(documentId, [tag]);
  }
  return grouped;
}

export async function listRootDocuments() {
  if (!isDatabaseConfigured()) return { configured: false, items: [] };
  const nodes = await listDocumentNodes();
  const summaries = summarizeRootDocuments(nodes);
  const tagAssignments = await listDocumentTagAssignments(
    summaries.map((item) => item.root.id),
  );
  const tagsByDocument = groupTagsByDocument(tagAssignments);
  return {
    configured: true,
    items: summaries.map((item) => ({
      ...item,
      tags: tagsByDocument.get(item.root.id) ?? [],
    })),
  };
}

export async function getDocumentReadView(id: string) {
  if (!isDatabaseConfigured()) {
    return { configured: false, document: null };
  }

  const [rows, nodes, relations, allTags] = await Promise.all([
    db().select().from(documents).where(eq(documents.id, id)).limit(1),
    listDocumentNodes(),
    db()
      .select({
        sourceId: documentReferences.sourceDocumentId,
        targetId: documentReferences.targetDocumentId,
      })
      .from(documentReferences)
      .where(
        or(
          eq(documentReferences.sourceDocumentId, id),
          eq(documentReferences.targetDocumentId, id),
        ),
      ),
    db()
      .select({ id: tags.id, name: tags.name, color: tags.color })
      .from(tags)
      .orderBy(tags.name),
  ]);

  const document = rows[0];
  if (!document) return { configured: true, document: null };

  const byId = new Map(nodes.map((node) => [node.id, node]));
  const path = getDocumentPath(byId, id);
  if (!path) throw new Error(`Document ${id} has an invalid parent chain.`);
  const archived = isArchivedPath(path);
  const moveDestinations = listDocumentMoveDestinations(nodes, id);
  const directChildCounts = countActiveDirectChildren(nodes);
  const visibleChildIds = nodes
    .filter(
      (node) => node.parentId === id && (archived || node.archivedAt === null),
    )
    .map((node) => node.id);
  const tagAssignments = await listDocumentTagAssignments([id, ...visibleChildIds]);
  const tagsByDocument = groupTagsByDocument(tagAssignments);

  const children = nodes
    .filter(
      (node) => node.parentId === id && (archived || node.archivedAt === null),
    )
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .map((node) => ({
      ...node,
      childCount: directChildCounts.get(node.id) ?? 0,
      tags: tagsByDocument.get(node.id) ?? [],
    }));

  function relatedDocument(relatedId: string) {
    const node = byId.get(relatedId);
    if (!node) return null;
    const relatedPath = getDocumentPath(byId, relatedId);
    return {
      id: node.id,
      title: node.title,
      archived: !relatedPath || isArchivedPath(relatedPath),
    };
  }

  const references = relations
    .filter((relation) => relation.sourceId === id)
    .map((relation) => relatedDocument(relation.targetId))
    .filter((node) => node !== null);
  const backlinks = relations
    .filter((relation) => relation.targetId === id)
    .map((relation) => relatedDocument(relation.sourceId))
    .filter((node) => node !== null);

  return {
    configured: true,
    document,
    path,
    archived,
    children,
    moveDestinations,
    references,
    backlinks,
    tags: tagsByDocument.get(id) ?? [],
    availableTags: allTags,
  };
}

export async function getLegacyRootDocumentId(topicId: string) {
  if (!isDatabaseConfigured()) return { configured: false, id: null };
  const [root] = await db()
    .select({ id: documents.id })
    .from(documents)
    .where(eq(documents.legacyTopicId, topicId))
    .limit(1);
  return { configured: true, id: root?.id ?? null };
}
