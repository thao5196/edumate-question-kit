"use client";

import { ShortAnswerTextQuestion } from "../../questions/short-answer-text-question";
import type { ShortAnswerTextQuestionPayload } from "../../types";
import type { QuestionViewComponentProps } from "../../registry/types";

export default function ShortAnswerTextQuestionView({
  model,
  answer,
  onAnswerChange,
  submitState,
  onSubmitRequest,
  explanationMarkdown,
}: QuestionViewComponentProps) {
  return (
    <ShortAnswerTextQuestion
      question={model as ShortAnswerTextQuestionPayload}
      answer={answer}
      onAnswerChange={onAnswerChange}
      submitState={submitState}
      onSubmitRequest={onSubmitRequest}
      explanationMarkdown={explanationMarkdown}
    />
  );
}
