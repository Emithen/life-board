import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownNode = {
  type: string;
  value?: string;
  children?: MarkdownNode[];
};

function preserveSoftBreaks() {
  return (tree: MarkdownNode) => {
    transformChildren(tree);
  };
}

function transformChildren(node: MarkdownNode) {
  if (!node.children) {
    return;
  }

  node.children = node.children.flatMap((child) => {
    transformChildren(child);

    if (child.type !== "text" || !child.value?.includes("\n")) {
      return child;
    }

    return child.value.split("\n").flatMap((value, index) =>
      index === 0
        ? [{ type: "text", value }]
        : [{ type: "break" }, { type: "text", value }],
    );
  });
}

export function DocumentMarkdown({ content }: { content: string }) {
  return (
    <Markdown remarkPlugins={[remarkGfm, preserveSoftBreaks]} skipHtml>
      {content}
    </Markdown>
  );
}
