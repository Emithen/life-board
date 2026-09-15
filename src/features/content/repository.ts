import "server-only";

import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import { documents, topics } from "@/db/schema";
import type { TopicColor } from "./model";
import {
  canMoveDocument,
  getDocumentPath,
  isArchivedPath,
  type DocumentNode,
} from "./tree";

export type TopicInput = {
  name: string;
  description: string | null;
  color: TopicColor;
};

export type DocumentInput = {
  title: string;
  content: string | null;
};

export async function insertRootDocument(input: DocumentInput) {
  const [created] = await db()
    .insert(documents)
    .values(input)
    .returning({ id: documents.id });
  return created?.id ?? null;
}

export async function listTopics(archived = false) {
  if (!isDatabaseConfigured()) {
    return { configured: false, items: [] };
  }

  const topicRows = await db()
    .select()
    .from(topics)
    .where(archived ? isNotNull(topics.archivedAt) : isNull(topics.archivedAt))
    .orderBy(desc(topics.updatedAt));

  if (archived || topicRows.length === 0) {
    return {
      configured: true,
      items: topicRows.map((topic) => ({
        ...topic,
        documentCount: 0,
        latestDocument: null as null | { title: string; updatedAt: Date },
      })),
    };
  }

  const documentRows = await db()
    .select({
      topicId: documents.topicId,
      title: documents.title,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .where(isNull(documents.archivedAt))
    .orderBy(desc(documents.updatedAt));

  const summaries = new Map<
    string,
    { count: number; latest: { title: string; updatedAt: Date } }
  >();

  for (const document of documentRows) {
    if (!document.topicId) continue;
    const summary = summaries.get(document.topicId);
    if (summary) {
      summary.count += 1;
    } else {
      summaries.set(document.topicId, {
        count: 1,
        latest: { title: document.title, updatedAt: document.updatedAt },
      });
    }
  }

  return {
    configured: true,
    items: topicRows.map((topic) => {
      const summary = summaries.get(topic.id);
      return {
        ...topic,
        documentCount: summary?.count ?? 0,
        latestDocument: summary?.latest ?? null,
      };
    }),
  };
}

export async function getTopicWithDocuments(topicId: string, archived = false) {
  if (!isDatabaseConfigured()) {
    return { configured: false, topic: null, items: [] };
  }

  const [topic] = await db()
    .select()
    .from(topics)
    .where(eq(topics.id, topicId))
    .limit(1);

  if (!topic) {
    return { configured: true, topic: null, items: [] };
  }

  const items = await db()
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.topicId, topicId),
        archived
          ? isNotNull(documents.archivedAt)
          : isNull(documents.archivedAt),
      ),
    )
    .orderBy(desc(documents.updatedAt));

  return { configured: true, topic, items };
}

export async function insertTopic(input: TopicInput) {
  await db().insert(topics).values(input);
}

export async function updateTopicById(id: string, input: TopicInput) {
  const updated = await db()
    .update(topics)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(topics.id, id), isNull(topics.archivedAt)))
    .returning({ id: topics.id });
  return updated.length > 0;
}

export async function setTopicArchived(id: string, archived: boolean) {
  const updated = await db()
    .update(topics)
    .set({ archivedAt: archived ? new Date() : null, updatedAt: new Date() })
    .where(
      and(
        eq(topics.id, id),
        archived ? isNull(topics.archivedAt) : isNotNull(topics.archivedAt),
      ),
    )
    .returning({ id: topics.id });
  return updated.length > 0;
}

export async function insertDocument(topicId: string, input: DocumentInput) {
  const [topic] = await db()
    .select({ id: topics.id })
    .from(topics)
    .where(and(eq(topics.id, topicId), isNull(topics.archivedAt)))
    .limit(1);

  if (!topic) return false;
  await db().insert(documents).values({ topicId, ...input });
  await db().update(topics).set({ updatedAt: new Date() }).where(eq(topics.id, topicId));
  return true;
}

export async function updateDocumentById(
  topicId: string,
  id: string,
  input: DocumentInput,
) {
  const updated = await db()
    .update(documents)
    .set({ ...input, updatedAt: new Date() })
    .where(
      and(
        eq(documents.id, id),
        eq(documents.topicId, topicId),
        isNull(documents.archivedAt),
      ),
    )
    .returning({ id: documents.id });

  if (updated.length > 0) {
    await db().update(topics).set({ updatedAt: new Date() }).where(eq(topics.id, topicId));
  }
  return updated.length > 0;
}

export async function setDocumentArchived(
  topicId: string,
  id: string,
  archived: boolean,
) {
  const updated = await db()
    .update(documents)
    .set({ archivedAt: archived ? new Date() : null, updatedAt: new Date() })
    .where(
      and(
        eq(documents.id, id),
        eq(documents.topicId, topicId),
        archived
          ? isNull(documents.archivedAt)
          : isNotNull(documents.archivedAt),
      ),
    )
    .returning({ id: documents.id });

  if (updated.length > 0) {
    await db().update(topics).set({ updatedAt: new Date() }).where(eq(topics.id, topicId));
  }
  return updated.length > 0;
}

async function getEditableDocument(id: string) {
  const [rows, nodes] = await Promise.all([
    db()
      .select({
        id: documents.id,
        topicId: documents.topicId,
        legacyTopicId: documents.legacyTopicId,
      })
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1),
    db()
      .select({
        id: documents.id,
        parentId: documents.parentId,
        title: documents.title,
        archivedAt: documents.archivedAt,
        updatedAt: documents.updatedAt,
        accentColor: documents.accentColor,
        legacyTopicId: documents.legacyTopicId,
      })
      .from(documents),
  ]);

  const document = rows[0];
  if (!document) return null;

  const byId = new Map(
    (nodes satisfies DocumentNode[]).map((node) => [node.id, node]),
  );
  const path = getDocumentPath(byId, id);
  if (!path || isArchivedPath(path)) return null;
  return document;
}

export async function updateDocumentInTreeById(
  id: string,
  input: DocumentInput,
) {
  const document = await getEditableDocument(id);
  if (!document) return false;
  const updatedAt = new Date();

  if (document.legacyTopicId) {
    const updated = await db()
      .update(topics)
      .set({ name: input.title, description: input.content, updatedAt })
      .where(
        and(
          eq(topics.id, document.legacyTopicId),
          isNull(topics.archivedAt),
        ),
      )
      .returning({ id: topics.id });
    return updated.length > 0;
  }

  const updated = await db()
    .update(documents)
    .set({ ...input, updatedAt })
    .where(and(eq(documents.id, id), isNull(documents.archivedAt)))
    .returning({ id: documents.id });

  if (updated.length > 0 && document.topicId) {
    await db()
      .update(topics)
      .set({ updatedAt })
      .where(eq(topics.id, document.topicId));
  }
  return updated.length > 0;
}

export async function archiveDocumentInTreeById(id: string) {
  const document = await getEditableDocument(id);
  if (!document) return false;
  const updatedAt = new Date();

  if (document.legacyTopicId) {
    const updated = await db()
      .update(topics)
      .set({ archivedAt: updatedAt, updatedAt })
      .where(
        and(
          eq(topics.id, document.legacyTopicId),
          isNull(topics.archivedAt),
        ),
      )
      .returning({ id: topics.id });
    return updated.length > 0;
  }

  const updated = await db()
    .update(documents)
    .set({ archivedAt: updatedAt, updatedAt })
    .where(and(eq(documents.id, id), isNull(documents.archivedAt)))
    .returning({ id: documents.id });

  if (updated.length > 0 && document.topicId) {
    await db()
      .update(topics)
      .set({ updatedAt })
      .where(eq(topics.id, document.topicId));
  }
  return updated.length > 0;
}

export async function insertChildDocument(
  parentId: string,
  input: DocumentInput,
) {
  const parent = await getEditableDocument(parentId);
  if (!parent) return null;

  const topicId = parent.topicId ?? parent.legacyTopicId;
  const updatedAt = new Date();
  const [created] = await db()
    .insert(documents)
    .values({
      ...input,
      parentId,
      topicId,
      updatedAt,
    })
    .returning({ id: documents.id });

  if (created && topicId) {
    await db()
      .update(topics)
      .set({ updatedAt })
      .where(eq(topics.id, topicId));
  }
  return created?.id ?? null;
}

export async function moveDocumentInTreeById(
  id: string,
  parentId: string | null,
) {
  const nodes = await db()
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

  if (!canMoveDocument(nodes, id, parentId)) return false;

  const updatedAt = new Date();
  const [updated] = await db()
    .update(documents)
    .set({ parentId, updatedAt })
    .where(and(eq(documents.id, id), isNull(documents.archivedAt)))
    .returning({ topicId: documents.topicId });

  if (updated?.topicId) {
    await db()
      .update(topics)
      .set({ updatedAt })
      .where(eq(topics.id, updated.topicId));
  }
  return Boolean(updated);
}
