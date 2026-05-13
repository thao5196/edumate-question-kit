import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

function getModeFromTableProperties(
  props: Element["properties"],
): string | null {
  if (!props) return null;
  for (const key of ["data-heading-mode", "dataHeadingMode"] as const) {
    const raw = props[key];
    if (typeof raw === "string") return raw;
    if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "string")
      return raw[0];
  }
  return null;
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

function rowCells(tr: Element): Element[] {
  return tr.children.filter(
    (c): c is Element =>
      c.type === "element" && (c.tagName === "th" || c.tagName === "td"),
  );
}

function normalizeToTbody(table: Element, rows: Element[]): void {
  const tbody: Element = {
    type: "element",
    tagName: "tbody",
    properties: {},
    children: rows,
  };
  table.children = [tbody];
}

export function rehypeHeadingModeTables(): (tree: Root) => void {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "table") return;

      const modeRaw = getModeFromTableProperties(node.properties);
      const mode = modeRaw?.toLowerCase();
      if (mode !== "none" && mode !== "col" && mode !== "both") return;

      const rows = collectTableRows(node);
      if (rows.length === 0) {
        delete node.properties?.["data-heading-mode"];
        delete node.properties?.dataHeadingMode;
        return;
      }

      if (mode === "none") {
        for (const tr of rows) {
          for (const cell of rowCells(tr)) {
            cell.tagName = "td";
          }
        }
        normalizeToTbody(node, rows);
      } else if (mode === "col") {
        for (const tr of rows) {
          const cells = rowCells(tr);
          for (let c = 0; c < cells.length; c++) {
            cells[c]!.tagName = c === 0 ? "th" : "td";
          }
        }
        normalizeToTbody(node, rows);
      } else {
        for (let r = 0; r < rows.length; r++) {
          const cells = rowCells(rows[r]!);
          for (let c = 0; c < cells.length; c++) {
            const header = r === 0 || c === 0;
            cells[c]!.tagName = header ? "th" : "td";
          }
        }
        normalizeToTbody(node, rows);
      }

      delete node.properties?.["data-heading-mode"];
      delete node.properties?.dataHeadingMode;
    });
  };
}
