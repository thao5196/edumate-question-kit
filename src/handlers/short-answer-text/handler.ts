import {
  buildShortAnswerTextSubmitValue,
  isShortAnswerTextSubmittable,
} from "../../questions/short-answer-text-question";
import type {
  ShortAnswerTextQuestionPayload,
  NextQuestionResponse,
  SubmitAnswerResponseValue,
} from "../../types";
import { isShortAnswerTextQuestion } from "../../types";
import type {
  ActivityAnswerDraft,
  QuestionRegistryEntry,
} from "../../registry/types";

export function parseShortAnswerTextQuestion(
  q: NextQuestionResponse,
): ShortAnswerTextQuestionPayload | null {
  return isShortAnswerTextQuestion(q) ? q : null;
}

export function canSubmitShortAnswerText(
  model: unknown,
  answer: ActivityAnswerDraft,
): boolean {
  const q = model as ShortAnswerTextQuestionPayload;
  return isShortAnswerTextSubmittable(
    q,
    typeof answer === "string" ? answer : null,
  );
}

export function toSubmitPayloadShortAnswerText(
  model: unknown,
  answer: ActivityAnswerDraft,
): SubmitAnswerResponseValue | null {
  const q = model as ShortAnswerTextQuestionPayload;
  const textAnswer = typeof answer === "string" ? answer : null;
  if (!isShortAnswerTextSubmittable(q, textAnswer)) return null;
  return {
    type: "short_answer_text",
    value: buildShortAnswerTextSubmitValue(q, textAnswer),
  };
}

export const shortAnswerTextQuestionEntry: QuestionRegistryEntry = {
  parse: (q) => parseShortAnswerTextQuestion(q),
  canSubmit: canSubmitShortAnswerText,
  toSubmitPayload: toSubmitPayloadShortAnswerText,
  invalidShapeTitle: "Không tải được câu trả lời ngắn",
  invalidShapeDescription: "Vui lòng thử lại sau.",
};
