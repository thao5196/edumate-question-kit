import type { Element, Properties, Root } from "hast";
import { visit } from "unist-util-visit";

function getColwidths(props: Properties | undefined): number[] | null {
  if (!props) return null;
  const raw = props["data-colwidth"] ?? props["dataColwidth"];
  if (typeof raw !== "string" || !raw) return null;
  const parts = raw.split(",").map(Number);
  if (parts.some((n) => !Number.isFinite(n))) return null;
  return parts;
}

function collectTableRows(table: Element): Element[] {
  const rows: Element[] = [];
  for (const child of table.children) {
    if (child.type !== "element") continue;
    if (
      child.tagName === "thead" ||
      child.tagName === "tbody" ||
      child.tagName === "tfoot"
    ) {
      for (const tr of child.children) {
        if (tr.type === "element" && tr.tagName === "tr") rows.push(tr);
      }
    } else if (child.tagName === "tr") {
      rows.push(child);
    }
  }
  return rows;
}

export function rehypeTableColwidth(): (tree: Root) => void {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "table") return;

      const widths = getColwidths(node.properties);
      if (!widths) return;

      const tableStyle = (node.properties.style as string | undefined) ?? "";
      node.properties.style = tableStyle
        ? `${tableStyle}; table-layout: fixed; width: 100%`
        : "table-layout: fixed; width: 100%";

      const rows = collectTableRows(node);
      for (const tr of rows) {
        const cells = tr.children.filter(
          (c): c is Element =>
            c.type === "element" && (c.tagName === "th" || c.tagName === "td"),
        );
        cells.forEach((cell, colIdx) => {
          const w = widths[colIdx];
          if (!w) return;
          const existing = (cell.properties.style as string | undefined) ?? "";
          cell.properties.style = existing
            ? `${existing}; width: ${w}px`
            : `width: ${w}px`;
        });
      }

      delete node.properties["data-colwidth"];
      delete node.properties["dataColwidth"];
    });
  };
}
