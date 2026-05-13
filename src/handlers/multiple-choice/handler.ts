import { isMcSubmittable } from "../../questions/multiple-choice-question";
import type {
  MultipleChoiceQuestionPayload,
  NextQuestionResponse,
  SubmitAnswerResponseValue,
} from "../../types";
import { isMultipleChoiceQuestion } from "../../types";
import type {
  ActivityAnswerDraft,
  QuestionRegistryEntry,
} from "../../registry/types";

export function parseMultipleChoiceQuestion(
  q: NextQuestionResponse,
): MultipleChoiceQuestionPayload | null {
  return isMultipleChoiceQuestion(q) ? q : null;
}

export function canSubmitMultipleChoice(
  model: unknown,
  answer: ActivityAnswerDraft,
): boolean {
  return isMcSubmittable(model as MultipleChoiceQuestionPayload, answer);
}

export function toSubmitPayloadMultipleChoice(
  model: unknown,
  answer: ActivityAnswerDraft,
): SubmitAnswerResponseValue | null {
  const q = model as MultipleChoiceQuestionPayload;
  if (typeof answer !== "string") return null;
  const id = answer.trim();
  if (!id || !q.options.some((o) => o.id === id)) return null;
  return { type: "multiple_choice", selectedOptionId: id };
}

export const multipleChoiceQuestionEntry: QuestionRegistryEntry = {
  parse: (q) => parseMultipleChoiceQuestion(q),
  canSubmit: canSubmitMultipleChoice,
  toSubmitPayload: toSubmitPayloadMultipleChoice,
  invalidShapeTitle: "Không tải được đáp án trắc nghiệm",
  invalidShapeDescription: "Vui lòng thử lại sau.",
};
