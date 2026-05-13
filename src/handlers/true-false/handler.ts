import { isTrueFalseSubmittable } from "../../questions/true-false-question";
import type {
  TrueFalseQuestionPayload,
  NextQuestionResponse,
  SubmitAnswerResponseValue,
} from "../../types";
import { isTrueFalseQuestion } from "../../types";
import type {
  ActivityAnswerDraft,
  QuestionRegistryEntry,
} from "../../registry/types";

export function parseTrueFalseQuestion(
  q: NextQuestionResponse,
): TrueFalseQuestionPayload | null {
  return isTrueFalseQuestion(q) ? q : null;
}

export function canSubmitTrueFalse(
  model: unknown,
  answer: ActivityAnswerDraft,
): boolean {
  return isTrueFalseSubmittable(model as TrueFalseQuestionPayload, answer);
}

export function toSubmitPayloadTrueFalse(
  _model: unknown,
  answer: ActivityAnswerDraft,
): SubmitAnswerResponseValue | null {
  if (answer !== "true" && answer !== "false") return null;
  return { type: "true_false", value: answer === "true" };
}

export const trueFalseQuestionEntry: QuestionRegistryEntry = {
  parse: (q) => parseTrueFalseQuestion(q),
  canSubmit: canSubmitTrueFalse,
  toSubmitPayload: toSubmitPayloadTrueFalse,
  invalidShapeTitle: "Không tải được câu hỏi đúng/sai",
  invalidShapeDescription: "Vui lòng thử lại sau.",
};
