"use client";

import { useMemo } from "react";
import type { ActivityAnswerDraft, SubmitPhase } from "../registry/types";
import type { MultipleResponseQuestionPayload } from "../types";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { cn } from "../utils/cn";
import { getMultipleChoiceLetter } from "../utils/option-letter";

import { ContentBlockRenderer } from "../content-block/content-block";
import { activityStemMarkdownClassName } from "../markdown/question-markdown-shared";

export type MultipleResponseQuestionModel = MultipleResponseQuestionPayload;

export function isMrSubmittable(
  question: MultipleResponseQuestionModel,
  answer: ActivityAnswerDraft,
): boolean {
  if (!Array.isArray(answer) || answer.length === 0) return false;
  return answer.every((id) => question.options.some((o) => o.id === id));
}

type Props = {
  question: MultipleResponseQuestionModel;
  answer: ActivityAnswerDraft;
  onAnswerChange: (v: ActivityAnswerDraft) => void;
  submitState: SubmitPhase;
  onSubmitRequest: () => void;
};

const MR_ITEM_PREFIX = "activity-mr-";

export function MultipleResponseQuestion({
  question,
  answer,
  onAnswerChange,
  submitState,
  onSubmitRequest,
}: Props) {
  const inputLocked = submitState === "submitting" || submitState === "graded";

  const selectedIds = useMemo((): string[] => {
    if (Array.isArray(answer)) return answer as string[];
    return [];
  }, [answer]);

  function toggleOption(optionId: string) {
    const next = selectedIds.includes(optionId)
      ? selectedIds.filter((id) => id !== optionId)
      : [...selectedIds, optionId];
    onAnswerChange(next.length > 0 ? next : null);
  }

  return (
    <div className={activityStemMarkdownClassName}>
      <ContentBlockRenderer blocks={question.question} />

      <div className="space-y-3 pt-4">
        <p
          className="text-base font-bold text-foreground"
          id="activity-mr-prompt"
        >
          Chọn một hoặc nhiều đáp án:
        </p>

        <div
          className="grid gap-3"
          role="group"
          aria-labelledby="activity-mr-prompt"
          onKeyDown={(e) => {
            const isSubmitCombo = e.key === "Enter" && (e.ctrlKey || e.metaKey);
            if (!isSubmitCombo) return;
            if (e.nativeEvent.isComposing) return;
            e.preventDefault();
            if (
              isMrSubmittable(question, answer) &&
              submitState !== "submitting" &&
              submitState !== "graded"
            ) {
              void onSubmitRequest();
            }
          }}
        >
          {question.options.map((opt, index) => {
            const itemId = `${MR_ITEM_PREFIX}${opt.id}`;
            const isChecked = selectedIds.includes(opt.id);

            return (
              <div key={opt.id} className="w-full min-w-0">
                <Checkbox
                  id={itemId}
                  checked={isChecked}
                  disabled={inputLocked}
                  onCheckedChange={() => toggleOption(opt.id)}
                  className="sr-only"
                />
                <Label
                  htmlFor={itemId}
                  className={cn(
                    "flex w-full min-w-0 cursor-pointer items-center gap-4 rounded-xl border-2 border-border bg-background px-4 py-4 font-normal",
                    "transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out",
                    "motion-reduce:transition-none motion-safe:active:scale-[0.99]",
                    "hover:bg-gray-50/80 dark:hover:bg-blue-950/30",
                    isChecked &&
                      "border-blue-500 bg-blue-50/50 dark:bg-blue-950/25",
                    inputLocked &&
                      "pointer-events-none cursor-not-allowed opacity-60",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold uppercase",
                      "transition-[color,background-color] duration-200 ease-out motion-reduce:transition-none",
                      isChecked
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200/80 text-foreground dark:bg-muted/80",
                    )}
                    aria-hidden
                  >
                    {getMultipleChoiceLetter(index)}
                  </span>
                  <ContentBlockRenderer
                    blocks={opt.content}
                    className="min-w-0 flex-1 text-base text-foreground"
                  />
                </Label>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          Ctrl+Enter hoặc Cmd+Enter để kiểm tra.
        </p>
      </div>
    </div>
  );
}
