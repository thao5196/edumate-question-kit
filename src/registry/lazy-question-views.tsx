"use client";

import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { SupportedActivityQuestionType } from "./supported-types";
import type { QuestionViewComponentProps } from "./types";

export const questionLazyViews = {
  short_answer_numeric: lazy(
    () => import("../handlers/short-answer-numeric/question-view"),
  ),
  short_answer_text: lazy(
    () => import("../handlers/short-answer-text/question-view"),
  ),
  multiple_choice: lazy(
    () => import("../handlers/multiple-choice/question-view"),
  ),
  multiple_response: lazy(
    () => import("../handlers/multiple-response/question-view"),
  ),
  true_false: lazy(() => import("../handlers/true-false/question-view")),
  drag_drop_order: lazy(
    () => import("../handlers/drag-drop-order/question-view"),
  ),
  column_arithmetic_equation: lazy(
    () => import("../handlers/column-arithmetic-equation/question-view"),
  ),
  column_arithmetic_multi_step: lazy(
    () => import("../handlers/column-arithmetic-multi-step/question-view"),
  ),
  expression_transformation_step: lazy(
    () => import("../handlers/expression-transformation-step/question-view"),
  ),
} satisfies Record<
  SupportedActivityQuestionType,
  LazyExoticComponent<ComponentType<QuestionViewComponentProps>>
>;
