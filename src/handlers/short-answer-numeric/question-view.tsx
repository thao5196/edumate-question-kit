"use client";

import { ShortAnswerNumericQuestion } from "../../questions/short-answer-numeric-question";
import type { ShortAnswerNumericQuestionPayload } from "../../types";
import type { QuestionViewComponentProps } from "../../registry/types";

export default function ShortAnswerNumericQuestionView({
  model,
  answer,
  onAnswerChange,
  submitState,
  onSubmitRequest,
  explanationMarkdown,
}: QuestionViewComponentProps) {
  return (
    <ShortAnswerNumericQuestion
      question={model as ShortAnswerNumericQuestionPayload}
      answer={answer}
      onAnswerChange={onAnswerChange}
      submitState={submitState}
      onSubmitRequest={onSubmitRequest}
      explanationMarkdown={explanationMarkdown}
    />
  );
}
