"use client";

import { ColumnArithmeticMultiStepQuestion } from "../../questions/column-arithmetic-multi-step-question";
import type { ColumnArithmeticMultiStepQuestionPayload } from "../../types";
import type { QuestionViewComponentProps } from "../../registry/types";

export default function ColumnArithmeticMultiStepQuestionView({
  model,
  answer,
  onAnswerChange,
  submitState,
  onSubmitRequest,
  explanationMarkdown,
}: QuestionViewComponentProps) {
  const q = model as ColumnArithmeticMultiStepQuestionPayload;
  return (
    <ColumnArithmeticMultiStepQuestion
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
