"use client";

import { MultipleChoiceQuestion } from "../../questions/multiple-choice-question";
import type { MultipleChoiceQuestionPayload } from "../../types";
import type { QuestionViewComponentProps } from "../../registry/types";

export default function MultipleChoiceQuestionView({
  model,
  answer,
  onAnswerChange,
  submitState,
  onSubmitRequest,
  explanationMarkdown,
}: QuestionViewComponentProps) {
  return (
    <MultipleChoiceQuestion
      question={model as MultipleChoiceQuestionPayload}
      answer={answer}
      onAnswerChange={onAnswerChange}
      submitState={submitState}
      onSubmitRequest={onSubmitRequest}
      explanationMarkdown={explanationMarkdown}
    />
  );
}
