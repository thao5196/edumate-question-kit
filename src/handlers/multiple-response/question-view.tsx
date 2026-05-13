"use client";

import { MultipleResponseQuestion } from "../../questions/multiple-response-question";
import type { MultipleResponseQuestionPayload } from "../../types";
import type { QuestionViewComponentProps } from "../../registry/types";

export default function MultipleResponseQuestionView({
  model,
  answer,
  onAnswerChange,
  submitState,
  onSubmitRequest,
  explanationMarkdown,
}: QuestionViewComponentProps) {
  return (
    <MultipleResponseQuestion
      question={model as MultipleResponseQuestionPayload}
      answer={answer}
      onAnswerChange={onAnswerChange}
      submitState={submitState}
      onSubmitRequest={onSubmitRequest}
      explanationMarkdown={explanationMarkdown}
    />
  );
}
