import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function DocumentMarkdown({ content }: { content: string }) {
  return (
    <Markdown remarkPlugins={[remarkGfm]} skipHtml>
      {content}
    </Markdown>
  );
}
