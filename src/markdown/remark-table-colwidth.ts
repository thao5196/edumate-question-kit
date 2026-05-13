import type { Html, Paragraph, Root, Table } from "mdast";

const COLWIDTH_HTML_RE =
  /^[\s\n]*<!--\s*table-colwidth:\[([^\]]*)\]\s*-->[\s\n]*$/i;

function parseColwidths(value: string): number[] | null {
  const m = value.match(COLWIDTH_HTML_RE);
  if (!m || !m[1]) return null;
  const parts = m[1].split(",").map((s) => Number(s.trim()));
  if (parts.some((n) => !Number.isFinite(n))) return null;
  return parts;
}

function isWhitespaceOnlyParagraph(node: Root["children"][number]): boolean {
  if (node.type !== "paragraph") return false;
  const p = node as Paragraph;
  if (p.children.length === 0) return true;
  return p.children.every((c) => c.type === "text" && /^\s*$/.test(c.value));
}

function attachColwidths(table: Table, widths: number[]): void {
  const data = (table.data ??= {}) as Record<string, unknown>;
  const existing = data.hProperties;
  const hProperties: Record<string, unknown> =
    existing && typeof existing === "object" && !Array.isArray(existing)
      ? { ...(existing as Record<string, unknown>) }
      : {};
  hProperties["data-colwidth"] = widths.join(",");
  data.hProperties = hProperties;
}

export function remarkTableColwidth() {
  return (tree: Root) => {
    const { children } = tree;
    let i = 0;
    while (i < children.length) {
      const node = children[i]!;
      if (node.type !== "html") {
        i++;
        continue;
      }
      const widths = parseColwidths((node as Html).value);
      if (!widths) {
        i++;
        continue;
      }

      let j = i + 1;
      while (j < children.length && isWhitespaceOnlyParagraph(children[j]!)) {
        j++;
      }

      if (j < children.length && children[j]!.type === "table") {
        attachColwidths(children[j] as Table, widths);
        children.splice(i, j - i);
        i++;
      } else {
        children.splice(i, 1);
      }
    }
  };
}
