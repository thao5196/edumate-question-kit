"use client";

import { useMemo } from "react";
import { RadioGroup, RadioGroupCardItem } from "../ui/radio-group";
import type { MultipleChoiceQuestionPayload } from "../types";
import { getMultipleChoiceLetter } from "../utils/option-letter";
import type { ActivityAnswerDraft, SubmitPhase } from "../registry/types";

import { ActivityQuestionExplanation } from "./activity-question-explanation";
import {
  activityStemMarkdownClassName,
  coarsePlainTextFromMarkdown,
  concatTextFromSegments,
} from "../markdown/question-markdown-shared";
import { ContentBlockRenderer } from "../content-block/content-block";

export type MultipleChoiceQuestionModel = MultipleChoiceQuestionPayload;

export function isMcSubmittable(
  question: MultipleChoiceQuestionModel,
  selectedId: ActivityAnswerDraft,
): boolean {
  if (typeof selectedId !== "string") return false;
  const id = selectedId.trim();
  if (!id) return false;
  return question.options.some((o) => o.id === id);
}

type MultipleChoiceQuestionProps = {
  question: MultipleChoiceQuestionModel;
  answer: ActivityAnswerDraft;
  onAnswerChange: (v: ActivityAnswerDraft) => void;
  submitState: SubmitPhase;
  onSubmitRequest: () => void;
  explanationMarkdown: string;
};

const MC_GROUP_PREFIX = "activity-mc-";

export function MultipleChoiceQuestion({
  question,
  answer,
  onAnswerChange,
  submitState,
  onSubmitRequest,
  explanationMarkdown,
}: MultipleChoiceQuestionProps) {
  const inputLocked = submitState === "submitting" || submitState === "graded";

  const selectedForThisQuestion =
    typeof answer === "string" &&
    answer.length > 0 &&
    question.options.some((o) => o.id === answer)
      ? answer
      : "";

  return (
    <div className={activityStemMarkdownClassName}>
      <ContentBlockRenderer blocks={question.question} />
      <div className="space-y-3 pt-4">
        <p
          className="text-base font-bold text-foreground"
          id="activity-mc-prompt"
        >
          Chọn một đáp án:
        </p>
        <RadioGroup
          key={question.questionId}
          className="grid gap-3"
          value={selectedForThisQuestion}
          onValueChange={(v) => {
            onAnswerChange(v || null);
          }}
          disabled={inputLocked}
          aria-labelledby="activity-mc-prompt"
          onKeyDown={(e) => {
            const isSubmitCombo = e.key === "Enter" && (e.ctrlKey || e.metaKey);
            if (!isSubmitCombo) return;
            if (e.nativeEvent.isComposing) return;
            e.preventDefault();
            const canSubmitLocal =
              isMcSubmittable(question, answer) &&
              submitState !== "submitting" &&
              submitState !== "graded";
            if (!canSubmitLocal) return;
            void onSubmitRequest();
          }}
        >
          {question.options.map((opt, index) => {
            const rawLabel = concatTextFromSegments(opt.content);
            const ariaLabel = coarsePlainTextFromMarkdown(rawLabel);
            const itemId = `${MC_GROUP_PREFIX}${opt.id}`;
            return (
              <RadioGroupCardItem
                key={opt.id}
                value={opt.id}
                id={itemId}
                letter={getMultipleChoiceLetter(index)}
                aria-label={ariaLabel}
              >
                <ContentBlockRenderer
                  blocks={opt.content}
                  className="min-w-0 flex-1 text-base text-foreground"
                />
              </RadioGroupCardItem>
            );
          })}
        </RadioGroup>
        <p className="text-xs text-muted-foreground">
          Ctrl+Enter hoặc Cmd+Enter để kiểm tra.
        </p>
      </div>
      <ActivityQuestionExplanation
        submitState={submitState}
        explanationMarkdown={explanationMarkdown}
      />
    </div>
  );
}
