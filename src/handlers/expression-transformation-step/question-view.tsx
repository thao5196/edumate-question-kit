"use client";

import { ExpressionTransformationStepQuestion } from "../../questions/expression-transformation-step-question";
import type { ExpressionTransformationStepQuestionPayload } from "../../types";
import type { QuestionViewComponentProps } from "../../registry/types";

export default function ExpressionTransformationStepQuestionView({
  model,
  answer,
  onAnswerChange,
  submitState,
  onSubmitRequest,
  explanationMarkdown,
}: QuestionViewComponentProps) {
  const q = model as ExpressionTransformationStepQuestionPayload;
  return (
    <ExpressionTransformationStepQuestion
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
