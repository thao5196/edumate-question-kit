import type {
  ShortAnswerNumericQuestionPayload,
  NextQuestionResponse,
  SubmitAnswerResponseValue,
} from "../../types";
import { isShortAnswerNumericQuestion } from "../../types";
import type {
  ActivityAnswerDraft,
  QuestionRegistryEntry,
} from "../../registry/types";

export function parseShortAnswerNumericQuestion(
  q: NextQuestionResponse,
): ShortAnswerNumericQuestionPayload | null {
  return isShortAnswerNumericQuestion(q) ? q : null;
}

export function canSubmitShortAnswerNumeric(
  _model: unknown,
  answer: ActivityAnswerDraft,
): boolean {
  return typeof answer === "string" && answer.trim().length > 0;
}

export function toSubmitPayloadShortAnswerNumeric(
  _model: unknown,
  answer: ActivityAnswerDraft,
): SubmitAnswerResponseValue | null {
  if (typeof answer !== "string") return null;
  const trimmed = answer.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  if (Number.isNaN(num)) return null;
  return { type: "short_answer_numeric", value: num };
}

export const shortAnswerNumericQuestionEntry: QuestionRegistryEntry = {
  parse: (q) => parseShortAnswerNumericQuestion(q),
  canSubmit: canSubmitShortAnswerNumeric,
  toSubmitPayload: toSubmitPayloadShortAnswerNumeric,
  invalidShapeTitle: "Không tải được câu trả lời số",
  invalidShapeDescription: "Vui lòng thử lại sau.",
};
