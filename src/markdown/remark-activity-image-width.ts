import type { Image, Parent, Root, Text } from "mdast";
import { visit } from "unist-util-visit";

/** Matches authoring suffix `{...}` containing image params after `]()`. */
const PARAM_BLOCK_RE = /^\s*\{([^}]+)\}\s*$/;

type ImageParams = {
  width?: number;
  align?: "left" | "center" | "right";
  inline?: boolean;
};

function parseImageParams(paramStr: string): ImageParams | null {
  const params: ImageParams = {};

  const wm = paramStr.match(/\bwidth\s*=\s*(\d+)/);
  if (wm) {
    const n = Number.parseInt(wm[1]!, 10);
    if (n > 0) params.width = n;
  }

  const am = paramStr.match(/\balign\s*=\s*(left|center|right)/);
  if (am) params.align = am[1] as "left" | "center" | "right";

  if (/\binline\b/.test(paramStr)) params.inline = true;

  if (!params.width && !params.align && !params.inline) return null;
  return params;
}

function mergeAdjacentImageParams(parent: Parent): void {
  const { children } = parent;
  let i = 0;
  while (i < children.length - 1) {
    const a = children[i];
    const b = children[i + 1];
    if (a?.type === "image" && b?.type === "text") {
      const m = (b as Text).value.match(PARAM_BLOCK_RE);
      if (m) {
        const imgParams = parseImageParams(m[1]!);
        if (imgParams) {
          const img = a as Image;
          const data = (img.data ??= {}) as Record<string, unknown>;
          const prev =
            data.hProperties &&
            typeof data.hProperties === "object" &&
            !Array.isArray(data.hProperties)
              ? { ...(data.hProperties as Record<string, string>) }
              : {};
          const hProps: Record<string, string> = { ...prev };
          if (imgParams.width) hProps.width = String(imgParams.width);
          if (imgParams.align) hProps["data-align"] = imgParams.align;
          if (imgParams.inline) hProps["data-inline"] = "true";
          data.hProperties = hProps;
          children.splice(i + 1, 1);
          continue;
        }
      }
    }
    i++;
  }
}

export function remarkActivityImageWidth(): (tree: Root) => void {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (
        node.type === "root" ||
        node.type === "paragraph" ||
        node.type === "blockquote" ||
        node.type === "listItem"
      ) {
        mergeAdjacentImageParams(node as Parent);
      }
    });
  };
}
