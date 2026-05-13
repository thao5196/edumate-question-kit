import type {
  ColumnArithmeticEquationQuestionPayload,
  NextQuestionResponse,
  SubmitAnswerResponseValue,
} from "../../types";
import {
  isColumnArithmeticEquationQuestion,
  isColumnArithmeticEquationSubmittable,
} from "../../types";
import type {
  ActivityAnswerDraft,
  QuestionRegistryEntry,
} from "../../registry/types";

export function parseColumnArithmeticEquationQuestion(
  q: NextQuestionResponse,
): ColumnArithmeticEquationQuestionPayload | null {
  return isColumnArithmeticEquationQuestion(q) ? q : null;
}

export function canSubmitColumnArithmeticEquation(
  model: unknown,
  answer: ActivityAnswerDraft,
): boolean {
  const q = model as ColumnArithmeticEquationQuestionPayload;
  return isColumnArithmeticEquationSubmittable(
    q,
    typeof answer === "string" ? answer : null,
  );
}

export function toSubmitPayloadColumnArithmeticEquation(
  model: unknown,
  answer: ActivityAnswerDraft,
): SubmitAnswerResponseValue | null {
  const q = model as ColumnArithmeticEquationQuestionPayload;
  const text = typeof answer === "string" ? answer : null;
  if (!isColumnArithmeticEquationSubmittable(q, text)) return null;
  return {
    type: "column_arithmetic_equation",
    value: Number(text),
  };
}

export const columnArithmeticEquationQuestionEntry: QuestionRegistryEntry = {
  parse: (q) => parseColumnArithmeticEquationQuestion(q),
  canSubmit: canSubmitColumnArithmeticEquation,
  toSubmitPayload: toSubmitPayloadColumnArithmeticEquation,
  invalidShapeTitle: "Không tải được câu đặt tính dọc",
  invalidShapeDescription: "Vui lòng thử lại sau.",
};
