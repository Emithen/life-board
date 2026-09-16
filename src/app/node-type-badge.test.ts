import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NodeTypeBadge } from "./node-type-badge";

test("각 노드 유형을 아이콘과 한글 라벨로 구분한다", () => {
  const html = (["structure", "concept", "reference"] as const)
    .map((nodeType) =>
      renderToStaticMarkup(createElement(NodeTypeBadge, { nodeType })),
    )
    .join("");

  assert.match(html, /data-node-type="structure"[^>]*>.*구조<\/span>/);
  assert.match(html, /data-node-type="concept"[^>]*>.*개념<\/span>/);
  assert.match(html, /data-node-type="reference"[^>]*>.*참조<\/span>/);
  assert.equal((html.match(/<svg/g) ?? []).length, 3);
});

