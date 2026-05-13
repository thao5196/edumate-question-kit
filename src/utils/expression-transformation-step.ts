import type { ExpressionTransformationStepQuestionPayload } from "../types";

export type TemplateSegment =
  | { kind: "text"; value: string }
  | { kind: "blank"; id: string };

/** Max length per blank when sending to API (clip on submit; inputs use same cap). */
export const EXPRESSION_TRANSFORMATION_BLANK_MAX_LENGTH = 200;

function templateBlankIdsInOrder(template: string): string[] {
  return [...template.matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1]!.trim());
}

/** Split `template` into text runs and `[[blank_id]]` placeholders. */
export function parseExpressionStepTemplate(
  template: string,
): TemplateSegment[] {
  const segments: TemplateSegment[] = [];
  const re = /\[\[([^\]]+)\]\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(template)) !== null) {
    const start = m.index;
    if (start > last) {
      segments.push({ kind: "text", value: template.slice(last, start) });
    }
    segments.push({ kind: "blank", id: m[1]!.trim() });
    last = start + m[0].length;
  }
  if (last < template.length) {
    segments.push({ kind: "text", value: template.slice(last) });
  }
  return segments;
}

/** Blank ids in step order, template order, first occurrence wins (dedupe). */
export function collectOrderedBlankIds(
  question: ExpressionTransformationStepQuestionPayload,
): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const step of question.steps) {
    for (const id of templateBlankIdsInOrder(step.template)) {
      if (!seen.has(id)) {
        seen.add(id);
        order.push(id);
      }
    }
  }
  return order;
}

export function isExpressionTransformationDraft(
  v: string | string[] | Record<string, string> | null,
): v is Record<string, string> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

export function isExpressionTransformationStepSubmittable(
  question: ExpressionTransformationStepQuestionPayload,
  draft: Record<string, string> | null | undefined,
): boolean {
  if (draft == null || typeof draft !== "object" || Array.isArray(draft))
    return false;
  const ids = collectOrderedBlankIds(question);
  if (ids.length === 0) return false;
  for (const id of ids) {
    const raw = draft[id];
    if (typeof raw !== "string") return false;
    const t = raw.trim();
    if (t.length === 0) return false;
    if (t.length > EXPRESSION_TRANSFORMATION_BLANK_MAX_LENGTH) return false;
  }
  return true;
}

/** Trim and clip each blank; returns `null` if not submittable. */
export function buildExpressionTransformationBlankAnswers(
  question: ExpressionTransformationStepQuestionPayload,
  draft: Record<string, string> | null | undefined,
): Record<string, string> | null {
  if (!isExpressionTransformationStepSubmittable(question, draft)) return null;
  const ids = collectOrderedBlankIds(question);
  const out: Record<string, string> = {};
  for (const id of ids) {
    out[id] = draft!
      [id]!.trim()
      .slice(0, EXPRESSION_TRANSFORMATION_BLANK_MAX_LENGTH);
  }
  return out;
}
