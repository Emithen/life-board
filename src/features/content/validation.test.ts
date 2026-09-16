import assert from "node:assert/strict";
import test from "node:test";
import { canNodeContainChildren, isNodeType } from "./model";
import {
  parseDocumentCreateInput,
  parseDocumentInput,
  parseEditableNodeTypeInput,
  parseReferenceCreateInput,
  parseTagInput,
  parseTopicInput,
} from "./validation";

function formData(values: Record<string, string>) {
  const data = new FormData();
  for (const [name, value] of Object.entries(values)) data.set(name, value);
  return data;
}

test("주제 입력을 정규화한다", () => {
  const result = parseTopicInput(
    formData({ name: "  웹 개발  ", description: "", color: "#047857" }),
  );
  assert.deepEqual(result, {
    success: true,
    data: { name: "웹 개발", description: null, color: "#047857" },
  });
});

test("허용되지 않은 주제 색상을 거부한다", () => {
  const result = parseTopicInput(
    formData({ name: "웹 개발", description: "", color: "#ffffff" }),
  );
  assert.equal(result.success, false);
  if (!result.success) assert.ok(result.fieldErrors.color);
});

test("간단한 Markdown 문서를 파싱한다", () => {
  const result = parseDocumentInput(
    formData({
      title: "Next.js 생태계 및 문법",
      content: "- drizzle ORM\n- server action",
    }),
  );
  assert.deepEqual(result, {
    success: true,
    data: {
      title: "Next.js 생태계 및 문법",
      content: "- drizzle ORM\n- server action",
    },
  });
});

test("제목 없는 문서를 거부한다", () => {
  const result = parseDocumentInput(formData({ title: "", content: "메모" }));
  assert.equal(result.success, false);
  if (!result.success) assert.ok(result.fieldErrors.title);
});

test("태그 이름의 공백을 정규화하고 제한된 색상만 허용한다", () => {
  const result = parseTagInput(
    formData({ name: "  검토   필요  ", color: "amber" }),
  );
  assert.deepEqual(result, {
    success: true,
    data: {
      name: "검토 필요",
      normalizedName: "검토 필요",
      color: "amber",
    },
  });
});

test("지원하지 않는 태그 색상을 거부한다", () => {
  const result = parseTagInput(formData({ name: "포화", color: "orange" }));
  assert.equal(result.success, false);
  if (!result.success) assert.ok(result.fieldErrors.color);
});

test("지원하는 노드 유형만 식별한다", () => {
  assert.equal(isNodeType("structure"), true);
  assert.equal(isNodeType("concept"), true);
  assert.equal(isNodeType("reference"), true);
  assert.equal(isNodeType("document"), false);
  assert.equal(canNodeContainChildren("structure"), true);
  assert.equal(canNodeContainChildren("concept"), false);
  assert.equal(canNodeContainChildren("reference"), false);
});

test("구조와 개념 노드 생성 입력을 허용한다", () => {
  for (const nodeType of ["structure", "concept"]) {
    const result = parseDocumentCreateInput(
      formData({ title: "새 노드", content: "내용", nodeType }),
    );
    assert.equal(result.success, true);
    if (result.success) assert.equal(result.data.nodeType, nodeType);
  }
});

test("생성 폼에서 참조 노드 유형을 허용하지 않는다", () => {
  const result = parseDocumentCreateInput(
    formData({ title: "바로가기", content: "", nodeType: "reference" }),
  );
  assert.equal(result.success, false);
  if (!result.success) assert.ok(result.fieldErrors.nodeType);
});

test("기존 노드는 구조와 개념 사이에서만 유형을 변경할 수 있다", () => {
  for (const nodeType of ["structure", "concept"]) {
    const result = parseEditableNodeTypeInput(formData({ nodeType }));
    assert.equal(result.success, true);
    if (result.success) assert.equal(result.data.nodeType, nodeType);
  }

  const reference = parseEditableNodeTypeInput(
    formData({ nodeType: "reference" }),
  );
  assert.equal(reference.success, false);
  if (!reference.success) assert.ok(reference.fieldErrors.nodeType);
});

test("참조 생성 대상 ID를 검증한다", () => {
  const validId = "d0e1ace2-a430-4e82-b63e-27bfc56c93cf";
  assert.deepEqual(
    parseReferenceCreateInput(formData({ targetDocumentId: validId })),
    { success: true, data: { targetDocumentId: validId } },
  );

  const invalid = parseReferenceCreateInput(
    formData({ targetDocumentId: "reference" }),
  );
  assert.equal(invalid.success, false);
  if (!invalid.success) assert.ok(invalid.fieldErrors.targetDocumentId);
});
