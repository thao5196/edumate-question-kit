"use client";

import { useEffect, useRef } from "react";
import { Textarea } from "../ui/textarea";
import type {
  ShortAnswerTextQuestionPayload,
  ShortAnswerTextInput,
} from "../types";
import type { ActivityAnswerDraft, SubmitPhase } from "../registry/types";

import { ActivityQuestionExplanation } from "./activity-question-explanation";
import { activityStemMarkdownClassName } from "../markdown/question-markdown-shared";
import { ContentBlockRenderer } from "../content-block/content-block";

export const DEFAULT_SHORT_ANSWER_TEXT_INPUT: ShortAnswerTextInput = {
  maxLength: 200,
  trimWhitespace: true,
  caseInsensitive: false,
};

export type ShortAnswerTextQuestionModel = ShortAnswerTextQuestionPayload;

export function buildShortAnswerTextSubmitValue(
  question: ShortAnswerTextQuestionModel,
  answer: string | null,
): string {
  const input: ShortAnswerTextInput =
    (question.input as ShortAnswerTextInput | undefined) ??
    DEFAULT_SHORT_ANSWER_TEXT_INPUT;
  const raw = answer ?? "";
  const clipped = raw.slice(0, input.maxLength);
  return input.trimWhitespace ? clipped.trim() : clipped;
}

export function isShortAnswerTextSubmittable(
  question: ShortAnswerTextQuestionModel,
  answer: string | null,
): boolean {
  const value = buildShortAnswerTextSubmitValue(question, answer);
  const required = question.validation?.required !== false;
  if (!required) return true;
  return value.length > 0;
}

type ShortAnswerTextQuestionProps = {
  question: ShortAnswerTextQuestionModel;
  answer: ActivityAnswerDraft;
  onAnswerChange: (v: ActivityAnswerDraft) => void;
  submitState: SubmitPhase;
  onSubmitRequest: () => void;
  explanationMarkdown: string;
};

const ANSWER_TEXTAREA_ID = "activity-short-answer-text-input";

export function ShortAnswerTextQuestion({
  question,
  answer,
  onAnswerChange,
  submitState,
  onSubmitRequest,
  explanationMarkdown,
}: ShortAnswerTextQuestionProps) {
  const input: ShortAnswerTextInput =
    (question.input as ShortAnswerTextInput | undefined) ??
    DEFAULT_SHORT_ANSWER_TEXT_INPUT;
  const answerText = typeof answer === "string" ? answer : "";
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputLocked = submitState === "submitting" || submitState === "graded";

  useEffect(() => {
    textareaRef.current?.focus();
  }, [question.questionId]);

  return (
    <div className={activityStemMarkdownClassName}>
      <ContentBlockRenderer blocks={question.question} />
      <div className="space-y-2 pt-2">
        <label
          htmlFor={ANSWER_TEXTAREA_ID}
          className="block text-base font-bold text-foreground"
        >
          Nhập câu trả lời của bạn:
        </label>
        <Textarea
          ref={textareaRef}
          id={ANSWER_TEXTAREA_ID}
          variant="bordered"
          rows={4}
          value={answerText}
          maxLength={input.maxLength}
          autoComplete="off"
          aria-label="Đáp án văn bản"
          placeholder="Nhập câu trả lời của bạn..."
          disabled={inputLocked}
          className="min-h-22 resize-y text-base focus-visible:border-blue-500 focus-visible:shadow-[inset_0_0_0_1px_#3b82f6]"
          onChange={(e) => {
            const next = e.target.value.slice(0, input.maxLength);
            onAnswerChange(next || null);
          }}
          onKeyDown={(e) => {
            const isSubmitCombo = e.key === "Enter" && (e.ctrlKey || e.metaKey);
            if (!isSubmitCombo) return;
            if (e.nativeEvent.isComposing) return;
            e.preventDefault();
            const canSubmitLocal =
              isShortAnswerTextSubmittable(question, answerText || null) &&
              submitState !== "submitting" &&
              submitState !== "graded";
            if (!canSubmitLocal) return;
            void onSubmitRequest();
          }}
        />
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
