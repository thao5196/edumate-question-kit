import type {
  ColumnArithmeticMultiStepQuestionPayload,
  NextQuestionResponse,
  SubmitAnswerResponseValue,
} from "../../types";
import {
  isColumnArithmeticMultiStepQuestion,
  isColumnArithmeticMultiStepSubmittable,
} from "../../types";
import type {
  ActivityAnswerDraft,
  QuestionRegistryEntry,
} from "../../registry/types";

export function parseColumnArithmeticMultiStepQuestion(
  q: NextQuestionResponse,
): ColumnArithmeticMultiStepQuestionPayload | null {
  return isColumnArithmeticMultiStepQuestion(q) ? q : null;
}

function isDraftRecord(
  answer: ActivityAnswerDraft,
): answer is Record<string, string> {
  return answer != null && typeof answer === "object" && !Array.isArray(answer);
}

export function canSubmitColumnArithmeticMultiStep(
  model: unknown,
  answer: ActivityAnswerDraft,
): boolean {
  const q = model as ColumnArithmeticMultiStepQuestionPayload;
  return isColumnArithmeticMultiStepSubmittable(
    q,
    isDraftRecord(answer) ? answer : null,
  );
}

export function toSubmitPayloadColumnArithmeticMultiStep(
  model: unknown,
  answer: ActivityAnswerDraft,
): SubmitAnswerResponseValue | null {
  const q = model as ColumnArithmeticMultiStepQuestionPayload;
  const record = isDraftRecord(answer) ? answer : null;
  if (!isColumnArithmeticMultiStepSubmittable(q, record)) return null;
  const slotAnswers: Record<string, number> = {};
  for (const step of q.steps) {
    for (const slot of step.equation.slots) {
      if (slot.isBlank) slotAnswers[slot.key] = Number(record![slot.key]);
    }
  }
  return {
    type: "column_arithmetic_multi_step",
    slotAnswers,
  } as SubmitAnswerResponseValue;
}

export const columnArithmeticMultiStepQuestionEntry: QuestionRegistryEntry = {
  parse: (q) => parseColumnArithmeticMultiStepQuestion(q),
  canSubmit: canSubmitColumnArithmeticMultiStep,
  toSubmitPayload: toSubmitPayloadColumnArithmeticMultiStep,
  invalidShapeTitle: "Không tải được câu đặt tính nhiều bước",
  invalidShapeDescription: "Vui lòng thử lại sau.",
};
