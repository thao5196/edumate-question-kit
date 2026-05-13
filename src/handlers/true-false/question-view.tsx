"use client";

import { TrueFalseQuestion } from "../../questions/true-false-question";
import type { TrueFalseQuestionPayload } from "../../types";
import type { QuestionViewComponentProps } from "../../registry/types";

export default function TrueFalseQuestionView({
  model,
  answer,
  onAnswerChange,
  submitState,
  onSubmitRequest,
  explanationMarkdown,
}: QuestionViewComponentProps) {
  return (
    <TrueFalseQuestion
      question={model as TrueFalseQuestionPayload}
      answer={answer}
      onAnswerChange={onAnswerChange}
      submitState={submitState}
      onSubmitRequest={onSubmitRequest}
      explanationMarkdown={explanationMarkdown}
    />
  );
}
