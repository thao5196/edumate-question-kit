"use client";

import { ColumnArithmeticEquationQuestion } from "../../questions/column-arithmetic-equation-question";
import type { ColumnArithmeticEquationQuestionPayload } from "../../types";
import type { QuestionViewComponentProps } from "../../registry/types";

export default function ColumnArithmeticEquationQuestionView({
  model,
  answer,
  onAnswerChange,
  submitState,
  onSubmitRequest,
  explanationMarkdown,
}: QuestionViewComponentProps) {
  const q = model as ColumnArithmeticEquationQuestionPayload;
  return (
    <ColumnArithmeticEquationQuestion
      key={q.questionId}
      question={q}
      answer={answer}
      onAnswerChange={onAnswerChange}
      submitState={submitState}
      onSubmitRequest={onSubmitRequest}
      explanationMarkdown={explanationMarkdown}
    />
  );
}
