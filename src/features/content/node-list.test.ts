import assert from "node:assert/strict";
import test from "node:test";
import { filterAndSortNodes } from "./node-list";

const items = [
  { id: "1", title: "나 구조", nodeType: "structure" as const, updatedAtValue: 2 },
  { id: "2", title: "가 개념", nodeType: "concept" as const, updatedAtValue: 3 },
  { id: "3", title: "다 참조", nodeType: "reference" as const, updatedAtValue: 1 },
];

test("노드 유형을 필터링한다", () => {
  assert.deepEqual(
    filterAndSortNodes(items, "concept", "updated-desc").map((item) => item.id),
    ["2"],
  );
});

test("최근 수정일, 제목, 유형 순으로 노드를 정렬한다", () => {
  assert.deepEqual(
    filterAndSortNodes(items, "all", "updated-desc").map((item) => item.id),
    ["2", "1", "3"],
  );
  assert.deepEqual(
    filterAndSortNodes(items, "all", "title-asc").map((item) => item.id),
    ["2", "1", "3"],
  );
  assert.deepEqual(
    filterAndSortNodes(items, "all", "type").map((item) => item.id),
    ["1", "2", "3"],
  );
});
