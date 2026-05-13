import { isMrSubmittable } from "../../questions/multiple-response-question";
import type {
  MultipleResponseQuestionPayload,
  NextQuestionResponse,
  SubmitAnswerResponseValue,
} from "../../types";
import { isMultipleResponseQuestion } from "../../types";
import type {
  ActivityAnswerDraft,
  QuestionRegistryEntry,
} from "../../registry/types";

export function parseMultipleResponseQuestion(
  q: NextQuestionResponse,
): MultipleResponseQuestionPayload | null {
  return isMultipleResponseQuestion(q) ? q : null;
}

export function canSubmitMultipleResponse(
  model: unknown,
  answer: ActivityAnswerDraft,
): boolean {
  return isMrSubmittable(model as MultipleResponseQuestionPayload, answer);
}

export function toSubmitPayloadMultipleResponse(
  _model: unknown,
  answer: ActivityAnswerDraft,
): SubmitAnswerResponseValue | null {
  if (!Array.isArray(answer) || answer.length === 0) return null;
  const ids = answer.filter(
    (id): id is string => typeof id === "string" && id.trim().length > 0,
  );
  if (ids.length === 0) return null;
  return { type: "multiple_response", selectedOptionIds: ids };
}

export const multipleResponseQuestionEntry: QuestionRegistryEntry = {
  parse: (q) => parseMultipleResponseQuestion(q),
  canSubmit: canSubmitMultipleResponse,
  toSubmitPayload: toSubmitPayloadMultipleResponse,
  invalidShapeTitle: "Không tải được câu hỏi chọn nhiều đáp án",
  invalidShapeDescription: "Vui lòng thử lại sau.",
};
