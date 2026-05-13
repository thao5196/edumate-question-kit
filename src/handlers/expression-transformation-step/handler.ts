import {
  buildExpressionTransformationBlankAnswers,
  isExpressionTransformationDraft,
  isExpressionTransformationStepSubmittable,
} from "../../utils/expression-transformation-step";
import type {
  ExpressionTransformationStepQuestionPayload,
  NextQuestionResponse,
  SubmitAnswerResponseValue,
} from "../../types";
import { isExpressionTransformationStepQuestion } from "../../types";
import type {
  ActivityAnswerDraft,
  QuestionRegistryEntry,
} from "../../registry/types";

export function parseExpressionTransformationStepQuestion(
  q: NextQuestionResponse,
): ExpressionTransformationStepQuestionPayload | null {
  return isExpressionTransformationStepQuestion(q) ? q : null;
}

export function canSubmitExpressionTransformationStep(
  model: unknown,
  answer: ActivityAnswerDraft,
): boolean {
  const q = model as ExpressionTransformationStepQuestionPayload;
  return (
    isExpressionTransformationDraft(answer) &&
    isExpressionTransformationStepSubmittable(q, answer)
  );
}

export function toSubmitPayloadExpressionTransformationStep(
  model: unknown,
  answer: ActivityAnswerDraft,
): SubmitAnswerResponseValue | null {
  const q = model as ExpressionTransformationStepQuestionPayload;
  const blankAnswers = buildExpressionTransformationBlankAnswers(
    q,
    isExpressionTransformationDraft(answer) ? answer : null,
  );
  if (!blankAnswers) return null;
  return { type: "expression_transformation_step", blankAnswers };
}

export const expressionTransformationStepQuestionEntry: QuestionRegistryEntry =
  {
    parse: (q) => parseExpressionTransformationStepQuestion(q),
    canSubmit: canSubmitExpressionTransformationStep,
    toSubmitPayload: toSubmitPayloadExpressionTransformationStep,
    invalidShapeTitle: "Không tải được câu biến đổi biểu thức theo bước",
    invalidShapeDescription: "Vui lòng thử lại sau.",
  };
