export const SUPPORTED_ACTIVITY_QUESTION_TYPES = [
  "multiple_choice",
  "multiple_response",
  "true_false",
  "short_answer_numeric",
  "short_answer_text",
  "drag_drop_order",
  "column_arithmetic_equation",
  "column_arithmetic_multi_step",
  "expression_transformation_step",
] as const;

export type SupportedActivityQuestionType =
  (typeof SUPPORTED_ACTIVITY_QUESTION_TYPES)[number];

export function isSupportedQuestionType(
  type: string,
): type is SupportedActivityQuestionType {
  return SUPPORTED_ACTIVITY_QUESTION_TYPES.includes(
    type as SupportedActivityQuestionType,
  );
}
