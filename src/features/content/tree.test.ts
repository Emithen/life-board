import assert from "node:assert/strict";
import test from "node:test";
import {
  canMoveDocument,
  countActiveDirectChildren,
  getDocumentPath,
  isArchivedPath,
  listDocumentMoveDestinations,
  listReferenceMoveDestinations,
  listReferenceTargets,
  summarizeRootDocuments,
  type DocumentNode,
} from "./tree";

function node(
  id: string,
  parentId: string | null,
  updatedDay: number,
  archived = false,
  nodeType: DocumentNode["nodeType"] = "structure",
): DocumentNode {
  return {
    id,
    parentId,
    nodeType,
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

test("참조 대상은 활성 구조와 현재 경로에서 보이는 개념으로 제한한다", () => {
  const nodes = [
    node("root", null, 1),
    node("section", "root", 2),
    node("nested", "section", 3),
    node("global-concept", null, 4, false, "concept"),
    node("root-concept", "root", 5, false, "concept"),
    node("section-concept", "section", 6, false, "concept"),
    node("nested-concept", "nested", 7, false, "concept"),
    node("other", null, 8),
    node("other-concept", "other", 9, false, "concept"),
    node("reference", "section", 10, false, "reference"),
    node("archived", null, 11, true),
  ];

  const targets = listReferenceTargets(nodes, "nested");
  assert.deepEqual(
    targets.map((target) => target.id).sort(),
    [
      "global-concept",
      "nested-concept",
      "other",
      "root",
      "root-concept",
      "section",
      "section-concept",
    ].sort(),
  );
});

test("개념과 참조 노드는 이동 목적지가 될 수 없다", () => {
  const nodes = [
    node("root", null, 1),
    node("moving", "root", 2),
    node("concept", null, 3, false, "concept"),
    node("reference", null, 4, false, "reference"),
  ];

  assert.equal(canMoveDocument(nodes, "moving", "concept"), false);
  assert.equal(canMoveDocument(nodes, "moving", "reference"), false);
});

test("참조 노드는 대상 개념이 공개된 구조 아래로만 이동할 수 있다", () => {
  const nodes = [
    node("root", null, 1),
    node("section", "root", 2),
    node("reference", "section", 3, false, "reference"),
    node("root-concept", "root", 4, false, "concept"),
    node("other", null, 5),
  ];

  assert.deepEqual(
    listReferenceMoveDestinations(
      nodes,
      "reference",
      "root-concept",
    ).map((destination) => destination.id),
    ["root", "section"],
  );
  assert.deepEqual(
    listReferenceMoveDestinations(nodes, "reference", "other").map(
      (destination) => destination.id,
    ),
    ["root", "section"],
  );
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

test("활성 상태인 직접 하위 문서만 집계한다", () => {
  const nodes = [
    node("root", null, 1),
    node("child", "root", 2),
    node("other-child", "root", 3),
    node("archived-child", "root", 4, true),
    node("grandchild", "child", 5),
  ];

  const counts = countActiveDirectChildren(nodes);
  assert.equal(counts.get("root"), 2);
  assert.equal(counts.get("child"), 1);
  assert.equal(counts.get("other-child"), undefined);
});
