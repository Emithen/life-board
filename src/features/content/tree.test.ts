import assert from "node:assert/strict";
import test from "node:test";
import {
  canMoveDocument,
  getDocumentPath,
  isArchivedPath,
  listDocumentMoveDestinations,
  summarizeRootDocuments,
  type DocumentNode,
} from "./tree";

function node(
  id: string,
  parentId: string | null,
  updatedDay: number,
  archived = false,
): DocumentNode {
  return {
    id,
    parentId,
    title: id,
    archivedAt: archived ? new Date("2026-01-10") : null,
    updatedAt: new Date(`2026-01-${String(updatedDay).padStart(2, "0")}`),
    accentColor: null,
    legacyTopicId: null,
  };
}

test("여러 단계의 하위 문서를 루트에 집계하고 보관된 가지를 제외한다", () => {
  const nodes = [
    node("root", null, 1),
    node("child", "root", 2),
    node("grandchild", "child", 5),
    node("archived", "root", 8, true),
    node("hidden-child", "archived", 9),
    node("other-root", null, 3),
  ];

  const summaries = summarizeRootDocuments(nodes);
  assert.deepEqual(summaries.map((summary) => summary.root.id), ["root", "other-root"]);
  assert.equal(summaries[0].descendantCount, 2);
  assert.equal(summaries[0].latestDocument?.id, "grandchild");
  assert.equal(summaries[0].latestActivityAt.toISOString(), "2026-01-05T00:00:00.000Z");

  const byId = new Map(nodes.map((item) => [item.id, item]));
  const path = getDocumentPath(byId, "hidden-child");
  assert.deepEqual(path?.map((item) => item.id), ["root", "archived", "hidden-child"]);
  assert.equal(isArchivedPath(path!), true);
});

test("손상된 부모 연결과 순환 경로를 탐색에 사용하지 않는다", () => {
  const nodes = [node("a", "b", 1), node("b", "a", 2), node("orphan", "missing", 3)];
  const byId = new Map(nodes.map((item) => [item.id, item]));
  assert.equal(getDocumentPath(byId, "a"), null);
  assert.equal(getDocumentPath(byId, "orphan"), null);
  assert.deepEqual(summarizeRootDocuments(nodes), []);
});

test("문서 이동 목적지에서 자신과 자손, 보관된 경로를 제외한다", () => {
  const nodes = [
    node("root", null, 1),
    node("child", "root", 2),
    node("grandchild", "child", 3),
    node("other", null, 4),
    node("archived", null, 5, true),
    node("hidden", "archived", 6),
  ];

  const destinations = listDocumentMoveDestinations(nodes, "child");
  assert.deepEqual(destinations.map((item) => item.id), ["other", "root"]);
  assert.equal(canMoveDocument(nodes, "child", null), true);
  assert.equal(canMoveDocument(nodes, "child", "other"), true);
  assert.equal(canMoveDocument(nodes, "child", "child"), false);
  assert.equal(canMoveDocument(nodes, "child", "grandchild"), false);
  assert.equal(canMoveDocument(nodes, "child", "archived"), false);
  assert.equal(canMoveDocument(nodes, "archived", null), false);
});
