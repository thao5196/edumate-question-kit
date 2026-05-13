"use client";

import { Callout } from "../ui/callout";
import { cn } from "../utils/cn";
import {
  activityExplanationMarkdownClassName,
  LearningActivityMarkdown,
} from "../markdown/question-markdown-shared";

export type SubmitPhase = "idle" | "submitting" | "graded" | "error";

export interface ActivityQuestionExplanationProps {
  submitState: SubmitPhase;
  explanationMarkdown: string;
}

const calloutEntranceClassName = cn(
  "animate-in duration-500 ease-out fade-in-0 slide-in-from-bottom-2",
  "motion-reduce:animate-none motion-reduce:opacity-100",
);

function ShimmerText({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block animate-pulse text-sm font-medium text-muted-foreground">
      {children}
    </span>
  );
}

export function ActivityQuestionExplanation({
  submitState,
  explanationMarkdown,
}: ActivityQuestionExplanationProps) {
  const showExplanation =
    submitState === "submitting" ||
    submitState === "graded" ||
    explanationMarkdown.length > 0;
  if (!showExplanation) return null;

  const showPlaceholder =
    (submitState === "submitting" || submitState === "graded") &&
    explanationMarkdown.length === 0;

  return (
    <div
      id="activity-explanation"
      className="space-y-2 border-t border-border/60 pt-4"
      aria-live="polite"
    >
      <div className={calloutEntranceClassName}>
        <Callout
          hue="blue"
          label="AI nhận xét"
          iconPlain
          aria-busy={showPlaceholder}
        >
          {showPlaceholder ? (
            <ShimmerText>
              {submitState === "graded"
                ? "AI đang soạn nhận xét..."
                : "AI đang đánh giá..."}
            </ShimmerText>
          ) : (
            <div className={activityExplanationMarkdownClassName}>
              <LearningActivityMarkdown>
                {explanationMarkdown}
              </LearningActivityMarkdown>
            </div>
          )}
        </Callout>
      </div>
    </div>
  );
}
