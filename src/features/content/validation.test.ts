import assert from "node:assert/strict";
import test from "node:test";
import { parseDocumentInput, parseTopicInput } from "./validation";

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
