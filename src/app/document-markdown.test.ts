import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DocumentMarkdown } from "./document-markdown";

test("문서 Markdown의 제목, 목록, GFM 체크박스를 렌더링한다", () => {
  const html = renderToStaticMarkup(
    createElement(DocumentMarkdown, {
      content: "## 배운 것\n\n- **Drizzle**\n- [x] 정리 완료",
    }),
  );

  assert.match(html, /<h2>배운 것<\/h2>/);
  assert.match(html, /<li><strong>Drizzle<\/strong><\/li>/);
  assert.match(html, /type="checkbox"/);
});

test("본문의 HTML과 위험한 링크를 실행 가능한 요소로 만들지 않는다", () => {
  const html = renderToStaticMarkup(
    createElement(DocumentMarkdown, {
      content: '<script>alert(1)</script>\n\n[클릭](javascript:alert%281%29)',
    }),
  );

  assert.doesNotMatch(html, /<script|javascript:/i);
  assert.match(html, /클릭/);
});
