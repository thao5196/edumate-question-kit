"use client";

import { DragDropOrderQuestion } from "../../questions/drag-drop-order-question";
import type { DragDropOrderQuestionPayload } from "../../types";
import type { QuestionViewComponentProps } from "../../registry/types";

export default function DragDropOrderQuestionView({
  model,
  answer,
  onAnswerChange,
  submitState,
  onSubmitRequest,
  explanationMarkdown,
}: QuestionViewComponentProps) {
  return (
    <DragDropOrderQuestion
      question={model as DragDropOrderQuestionPayload}
      answer={answer}
      onAnswerChange={onAnswerChange}
      submitState={submitState}
      onSubmitRequest={onSubmitRequest}
      explanationMarkdown={explanationMarkdown}
    />
  );
}
