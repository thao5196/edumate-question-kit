"use client";

import type {
  ComponentProps,
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactNode,
} from "react";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { rehypeHeadingModeTables } from "./rehype-heading-mode-tables";
import { rehypeTableColwidth } from "./rehype-table-colwidth";
import { remarkActivityImageWidth } from "./remark-activity-image-width";
import { remarkHeadingModeTables } from "./remark-heading-mode-tables";
import { remarkTableColwidth } from "./remark-table-colwidth";
import type { ActivityQuestionSegment } from "../types";
import { cn } from "../utils/cn";

/** Shared pipeline: GFM, table heading-mode, math AST, KaTeX HTML via rehype. */
export const activityRemarkPlugins = [
  remarkGfm,
  remarkHeadingModeTables,
  remarkTableColwidth,
  remarkActivityImageWidth,
  remarkMath,
];
export const activityRehypePlugins = [
  [
    rehypeKatex,
    {
      errorColor: "#9ca3af",
      strict: "ignore",
    },
  ],
  rehypeHeadingModeTables,
  rehypeTableColwidth,
] as NonNullable<ComponentProps<typeof Markdown>["rehypePlugins"]>;

const CARD_RE = /\{card\}([\s\S]*?)\{\/card\}/g;
const COLOR_RE = /\{color:([^}]+)\}([\s\S]*?)\{\/color\}/g;

export const CARD_PREFIX = "__CARD__:";
export const COLOR_PREFIX = "__COLOR__:";

export function replaceCardPlaceholders(markdown: string): string {
  return markdown.replace(CARD_RE, (_full, inner: string) => {
    const token = `${CARD_PREFIX}${encodeURIComponent(inner)}`;
    return `\`${token}\``;
  });
}

export function replaceColorPlaceholders(markdown: string): string {
  return markdown.replace(
    COLOR_RE,
    (_full, colorRaw: string, inner: string) => {
      const payload = encodeURIComponent(
        JSON.stringify({ color: colorRaw.trim(), inner }),
      );
      const token = `${COLOR_PREFIX}${payload}`;
      return `\`${token}\``;
    },
  );
}

const HEX_RE =
  /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const RGB_RE = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
const RGBA_RE =
  /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/;
const HSL_RE = /^hsl\(\s*(-?\d+)\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/;
const HSLA_RE =
  /^hsla\(\s*(-?\d+)\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(0|1|0?\.\d+)\s*\)$/;

function rgbPartsValid(r: number, g: number, b: number): boolean {
  return r <= 255 && g <= 255 && b <= 255;
}

export function parseSafeCssColor(raw: string): string | null {
  const input = raw.trim();
  if (input.length === 0) return null;
  if (HEX_RE.test(input)) return input;
  let m = input.match(RGB_RE);
  if (m) {
    const r = Number(m[1]);
    const g = Number(m[2]);
    const b = Number(m[3]);
    if (rgbPartsValid(r, g, b)) return input;
    return null;
  }
  m = input.match(RGBA_RE);
  if (m) {
    const r = Number(m[1]);
    const g = Number(m[2]);
    const b = Number(m[3]);
    if (rgbPartsValid(r, g, b)) return input;
    return null;
  }
  m = input.match(HSL_RE);
  if (m) {
    const s = Number(m[2]);
    const l = Number(m[3]);
    if (s <= 100 && l <= 100) return input;
    return null;
  }
  m = input.match(HSLA_RE);
  if (m) {
    const s = Number(m[2]);
    const l = Number(m[3]);
    if (s <= 100 && l <= 100) return input;
    return null;
  }
  return null;
}

export function prepareActivityStemMarkdown(raw: string): string {
  return replaceCardPlaceholders(replaceColorPlaceholders(raw));
}

export function prepareStemInnerForNestedMarkdown(inner: string): string {
  return replaceCardPlaceholders(replaceColorPlaceholders(inner));
}

export function concatStemFromQuestion(question: {
  question: ActivityQuestionSegment[];
}): string {
  return question.question
    .filter((s) => s.type === "text")
    .map((s) => s.text)
    .join("\n\n");
}

export function concatTextFromSegments(
  segments: ActivityQuestionSegment[],
): string {
  return segments
    .filter((s) => s.type === "text")
    .map((s) => s.text)
    .join("");
}

export function getPlainTextFromChildren(children: ReactNode): string {
  if (children == null || typeof children === "boolean") return "";
  if (typeof children === "string" || typeof children === "number")
    return String(children);
  if (Array.isArray(children))
    return children.map(getPlainTextFromChildren).join("");
  return "";
}

export function coarsePlainTextFromMarkdown(raw: string): string {
  let s = raw;
  s = s.replace(/\$\$[\s\S]*?\$\$/g, " ");
  s = s.replace(/\$[^$\n]+?\$/g, " ");
  s = s.replace(/\\\[[\s\S]*?\\\]/g, " ");
  s = s.replace(/\\\([\s\S]*?\\\)/g, " ");
  s = s.replace(/\*\*(.+?)\*\*/g, "$1");
  s = s.replace(/\*(.+?)\*/g, "$1");
  s = s.replace(/`([^`]+)`/g, "$1");
  s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  s = s.replace(/\{width=\d+\}/g, " ");
  s = s.replace(/#{1,6}\s*/g, "");
  const out = s.replace(/\s+/g, " ").trim();
  return out.length > 0 ? out.slice(0, 200) : raw.slice(0, 120);
}

type CardTextProps = {
  text: string;
  className?: string;
};

export function CardText({ text, className }: CardTextProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-[1.25em] items-center rounded-lg bg-rose-100 px-2.5 py-1 font-semibold text-rose-600 align-baseline tabular-nums dark:bg-rose-950/40 dark:text-rose-300",
        className,
      )}
    >
      {text}
    </span>
  );
}

export const activityStemMarkdownClassName = cn(
  "space-y-4 text-left text-lg leading-relaxed text-foreground/95",
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
  "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-foreground",
  "[&_p]:whitespace-pre-wrap [&_p]:leading-relaxed",
  "[&_table]:w-full [&_table]:border-collapse [&_table]:text-base",
  "[&_th]:border [&_th]:border-orange-300 [&_th]:bg-orange-100 [&_th]:px-3 [&_th]:py-2 [&_th]:align-middle [&_th]:font-bold [&_th]:text-foreground",
  "[&_td]:border [&_td]:border-orange-300 [&_td]:px-3 [&_td]:py-2 [&_td]:align-middle",
  "[&_strong]:font-bold",
  "[&_ul]:list-inside [&_ul]:list-disc [&_ul]:space-y-1",
  "[&_ol]:list-inside [&_ol]:list-decimal",
  "[&_.katex]:text-foreground [&_.katex-display]:mx-auto [&_.katex-display]:my-3 [&_.katex-display]:block [&_.katex-display]:max-w-full [&_.katex-display]:overflow-x-auto",
);

export const activityExplanationMarkdownClassName = cn(
  activityStemMarkdownClassName,
  "!text-base !leading-relaxed text-foreground/90",
  "[&_p]:text-foreground/90 [&_h1]:text-foreground/95 [&_strong]:text-foreground/95",
);

function stemColoredInnerParagraph({ children }: { children?: ReactNode }) {
  return (
    <span className="inline leading-relaxed not-first:mt-2">{children}</span>
  );
}

function stemPhrasingParagraph({ children }: { children?: ReactNode }) {
  return (
    <span className="block text-left whitespace-pre-wrap leading-snug not-first:mt-2">
      {children}
    </span>
  );
}

export type CreateStemMarkdownOptions = {
  phrasingParagraphs?: boolean;
};

function parsePositivePxWidth(width: unknown): number | undefined {
  if (typeof width === "number" && Number.isFinite(width) && width > 0) {
    return Math.floor(width);
  }
  if (typeof width === "string" && width.length > 0) {
    const n = Number.parseInt(width, 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return undefined;
}

export function createStemMarkdownComponents(
  options?: CreateStemMarkdownOptions,
): Components {
  const phrasingParagraphs = Boolean(options?.phrasingParagraphs);
  const components: Components = {
    ...(phrasingParagraphs ? { p: stemPhrasingParagraph } : {}),
    img: ({
      width,
      alt,
      className,
      style,
      "data-align": dataAlign,
      "data-inline": dataInline,
      ...rest
    }: ComponentPropsWithoutRef<"img"> & {
      "data-align"?: string;
      "data-inline"?: string;
    }) => {
      const px = parsePositivePxWidth(width);
      const styleObj =
        style && typeof style === "object" && !Array.isArray(style)
          ? (style as CSSProperties)
          : {};
      const isInline = dataInline === "true";
      const align = dataAlign as "left" | "center" | "right" | undefined;

      let layoutStyle: CSSProperties;
      if (isInline) {
        layoutStyle = {
          display: "inline",
          verticalAlign: "middle",
          height: "auto",
          maxWidth: "100%",
          ...(px ? { width: `${px}px` } : {}),
        };
      } else if (align === "left") {
        layoutStyle = {
          display: "block",
          marginRight: "auto",
          ...(px ? { maxWidth: `min(100%, ${px}px)` } : {}),
        };
      } else if (align === "right") {
        layoutStyle = {
          display: "block",
          marginLeft: "auto",
          ...(px ? { maxWidth: `min(100%, ${px}px)` } : {}),
        };
      } else if (align === "center") {
        layoutStyle = {
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
          ...(px ? { maxWidth: `min(100%, ${px}px)` } : {}),
        };
      } else {
        layoutStyle = {
          display: "block",
          marginRight: "auto",
          ...(px ? { maxWidth: `min(100%, ${px}px)` } : {}),
        };
      }

      return (
        <img
          {...rest}
          alt={alt ?? ""}
          width={isInline ? undefined : px}
          className={cn("max-w-full h-auto", className)}
          style={{ ...styleObj, ...layoutStyle }}
        />
      );
    },
    code: ({
      className,
      children,
      ...rest
    }: {
      className?: string;
      children?: ReactNode;
    }) => {
      if (className) {
        return (
          <code className={className} {...rest}>
            {children}
          </code>
        );
      }
      const text = getPlainTextFromChildren(children);
      if (text.startsWith(COLOR_PREFIX)) {
        const encoded = text.slice(COLOR_PREFIX.length);
        let parsed: { color: string; inner: string };
        try {
          parsed = JSON.parse(decodeURIComponent(encoded)) as {
            color: string;
            inner: string;
          };
        } catch {
          return (
            <code className="rounded bg-muted px-1" {...rest}>
              {children}
            </code>
          );
        }
        const safeColor = parseSafeCssColor(parsed.color);
        const nestedMarkdown = prepareStemInnerForNestedMarkdown(parsed.inner);
        const nestedComponents: Components = {
          ...components,
          p: stemColoredInnerParagraph,
        };
        return (
          <span
            className={cn(
              "inline align-baseline",
              !safeColor && "text-muted-foreground",
            )}
            style={safeColor ? { color: safeColor } : undefined}
          >
            <Markdown
              remarkPlugins={activityRemarkPlugins}
              rehypePlugins={activityRehypePlugins}
              components={nestedComponents}
            >
              {nestedMarkdown}
            </Markdown>
          </span>
        );
      }
      if (text.startsWith(CARD_PREFIX)) {
        const encoded = text.slice(CARD_PREFIX.length);
        let decoded: string;
        try {
          decoded = decodeURIComponent(encoded);
        } catch {
          return (
            <code className="rounded bg-muted px-1" {...rest}>
              {children}
            </code>
          );
        }
        return <CardText text={decoded} />;
      }
      return (
        <code
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-base"
          {...rest}
        >
          {children}
        </code>
      );
    },
  };
  return components;
}

export type LearningActivityMarkdownProps = {
  children: string;
  className?: string;
  compact?: boolean;
};

export function LearningActivityMarkdown({
  children,
  className,
  compact,
}: LearningActivityMarkdownProps) {
  const stemComponents = createStemMarkdownComponents(
    compact ? { phrasingParagraphs: true } : undefined,
  );
  const body = (
    <Markdown
      remarkPlugins={activityRemarkPlugins}
      rehypePlugins={activityRehypePlugins}
      components={stemComponents}
    >
      {children}
    </Markdown>
  );

  if (compact) {
    return (
      <span className={cn("block min-w-0 [&_.katex-display]:my-2", className)}>
        {body}
      </span>
    );
  }
  return className ? <div className={className}>{body}</div> : body;
}
