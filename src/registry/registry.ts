import type { QuestionRegistryEntry } from "./types";
import type { SupportedActivityQuestionType } from "./supported-types";
import { columnArithmeticEquationQuestionEntry } from "../handlers/column-arithmetic-equation/handler";
import { columnArithmeticMultiStepQuestionEntry } from "../handlers/column-arithmetic-multi-step/handler";
import { dragDropOrderQuestionEntry } from "../handlers/drag-drop-order/handler";
import { expressionTransformationStepQuestionEntry } from "../handlers/expression-transformation-step/handler";
import { multipleChoiceQuestionEntry } from "../handlers/multiple-choice/handler";
import { multipleResponseQuestionEntry } from "../handlers/multiple-response/handler";
import { shortAnswerNumericQuestionEntry } from "../handlers/short-answer-numeric/handler";
import { shortAnswerTextQuestionEntry } from "../handlers/short-answer-text/handler";
import { trueFalseQuestionEntry } from "../handlers/true-false/handler";

export const QUESTION_REGISTRY = {
  short_answer_numeric: shortAnswerNumericQuestionEntry,
  short_answer_text: shortAnswerTextQuestionEntry,
  multiple_choice: multipleChoiceQuestionEntry,
  multiple_response: multipleResponseQuestionEntry,
  true_false: trueFalseQuestionEntry,
  drag_drop_order: dragDropOrderQuestionEntry,
  column_arithmetic_equation: columnArithmeticEquationQuestionEntry,
  column_arithmetic_multi_step: columnArithmeticMultiStepQuestionEntry,
  expression_transformation_step: expressionTransformationStepQuestionEntry,
} satisfies Record<SupportedActivityQuestionType, QuestionRegistryEntry>;
