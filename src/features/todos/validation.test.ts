import assert from "node:assert/strict";
import test from "node:test";
import {
  isValidDate,
  isValidTodoId,
  parseTodoInput,
} from "./validation";

function todoFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  const values = {
    title: "할 일",
    notes: "메모",
    dueDate: "2026-09-12",
    priority: "2",
    ...overrides,
  };

  for (const [name, value] of Object.entries(values)) {
    formData.set(name, value);
  }

  return formData;
}

test("유효한 Todo 입력을 정규화한다", () => {
  const result = parseTodoInput(
    todoFormData({ title: "  할 일  ", notes: "", dueDate: "" }),
  );

  assert.deepEqual(result, {
    success: true,
    data: {
      title: "할 일",
      notes: null,
      dueDate: null,
      priority: 2,
    },
  });
});

test("잘못된 필드를 모두 반환한다", () => {
  const result = parseTodoInput(
    todoFormData({ title: "", dueDate: "2026-02-30", priority: "9" }),
  );

  assert.equal(result.success, false);
  if (!result.success) {
    assert.deepEqual(Object.keys(result.fieldErrors).sort(), [
      "dueDate",
      "priority",
      "title",
    ]);
  }
});

test("실재하는 달력 날짜만 허용한다", () => {
  assert.equal(isValidDate("2024-02-29"), true);
  assert.equal(isValidDate("2025-02-29"), false);
  assert.equal(isValidDate("2026-13-01"), false);
});

test("지원하는 UUID 형식만 허용한다", () => {
  assert.equal(isValidTodoId("550e8400-e29b-41d4-a716-446655440000"), true);
  assert.equal(isValidTodoId("not-a-uuid"), false);
});
