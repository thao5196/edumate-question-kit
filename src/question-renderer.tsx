"use client";

import type { NextQuestionResponse } from "./types";
import type { ActivityAnswerDraft, SubmitPhase } from "./registry/types";
import { resolveQuestion } from "./registry/resolve-question";
import { isSupportedQuestionType } from "./registry/supported-types";
import { LazyQuestionBody } from "./registry/lazy-question-body";
import { InvalidQuestionShape } from "./registry/invalid-question-shape";
import { UnsupportedQuestionPlaceholder } from "./questions/unsupported-question-placeholder";

export type QuestionRendererProps = {
  question: NextQuestionResponse;
  answer: ActivityAnswerDraft;
  onAnswerChange: (v: ActivityAnswerDraft) => void;
  submitState: SubmitPhase;
  onSubmitRequest: () => void;
  explanationMarkdown?: string;
  className?: string;
};

export function QuestionRenderer({
  question,
  answer,
  onAnswerChange,
  submitState,
  onSubmitRequest,
  explanationMarkdown = "",
  className,
}: QuestionRendererProps) {
  const resolved = resolveQuestion(question);

  if (!resolved) return null;

  if (resolved.kind === "unsupported") {
    return (
      <UnsupportedQuestionPlaceholder type={resolved.activityType as any} />
    );
  }

  if (resolved.kind === "invalid_shape") {
    return (
      <InvalidQuestionShape
        title={resolved.title}
        description={resolved.description}
      />
    );
  }

  if (!isSupportedQuestionType(question.type)) return null;

  return (
    <div className={className}>
      <LazyQuestionBody
        questionType={question.type}
        model={resolved.model}
        answer={answer}
        onAnswerChange={onAnswerChange}
        submitState={submitState}
        onSubmitRequest={onSubmitRequest}
        explanationMarkdown={explanationMarkdown}
      />
    </div>
  );
}
