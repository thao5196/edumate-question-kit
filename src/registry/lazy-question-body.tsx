"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import type { SupportedActivityQuestionType } from "./supported-types";
import { questionLazyViews } from "./lazy-question-views";
import type { QuestionViewComponentProps } from "./types";

type LazyQuestionBodyProps = QuestionViewComponentProps & {
  questionType: SupportedActivityQuestionType;
};

export function LazyQuestionBody({
  questionType,
  model,
  answer,
  onAnswerChange,
  submitState,
  onSubmitRequest,
  explanationMarkdown,
}: LazyQuestionBodyProps) {
  const LazyComp = questionLazyViews[questionType];
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12" aria-busy="true">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LazyComp
        model={model}
        answer={answer}
        onAnswerChange={onAnswerChange}
        submitState={submitState}
        onSubmitRequest={onSubmitRequest}
        explanationMarkdown={explanationMarkdown}
      />
    </Suspense>
  );
}
