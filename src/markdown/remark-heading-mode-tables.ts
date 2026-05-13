import type { Html, Paragraph, Root, Table } from "mdast";

const HEADING_MODE_HTML_RE =
  /^[\s\n]*<!--\s*heading-mode:\s*(col|both|none)\s*-->[\s\n]*$/i;

function parseHeadingMode(value: string): "col" | "both" | "none" | null {
  const m = value.match(HEADING_MODE_HTML_RE);
  if (!m || !m[1]) return null;
  const mode = m[1].toLowerCase();
  if (mode === "col" || mode === "both" || mode === "none") return mode;
  return null;
}

function isWhitespaceOnlyParagraph(node: Root["children"][number]): boolean {
  if (node.type !== "paragraph") return false;
  const p = node as Paragraph;
  if (p.children.length === 0) return true;
  return p.children.every((c) => c.type === "text" && /^\s*$/.test(c.value));
}

function setTableHeadingMode(
  table: Table,
  mode: "col" | "both" | "none",
): void {
  const data = (table.data ??= {}) as Record<string, unknown>;
  const existing = data.hProperties;
  const hProperties: Record<string, string> =
    existing && typeof existing === "object" && !Array.isArray(existing)
      ? { ...(existing as Record<string, string>) }
      : {};
  hProperties["data-heading-mode"] = mode;
  data.hProperties = hProperties;
}

export function remarkHeadingModeTables() {
  return (tree: Root) => {
    const { children } = tree;
    let i = 0;
    while (i < children.length) {
      const node = children[i]!;
      if (node.type !== "html") {
        i++;
        continue;
      }
      const mode = parseHeadingMode((node as Html).value);
      if (!mode) {
        i++;
        continue;
      }

      let j = i + 1;
      while (j < children.length && isWhitespaceOnlyParagraph(children[j]!)) {
        j++;
      }

      if (j < children.length && children[j]!.type === "table") {
        setTableHeadingMode(children[j] as Table, mode);
        children.splice(i, j - i);
        i++;
      } else {
        children.splice(i, 1);
      }
    }
  };
}
