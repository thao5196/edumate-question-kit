"use client";

import { useEffect, useRef } from "react";
import { Input } from "../ui/input";
import type { ShortAnswerNumericQuestionPayload } from "../types";
import type { ShortAnswerNumericInput } from "../types";
import type { ActivityAnswerDraft, SubmitPhase } from "../registry/types";

import { ActivityQuestionExplanation } from "./activity-question-explanation";
import { activityStemMarkdownClassName } from "../markdown/question-markdown-shared";
import { ContentBlockRenderer } from "../content-block/content-block";

const DEFAULT_NUMERIC_INPUT: ShortAnswerNumericInput = {
  allowDecimal: false,
  allowNegative: false,
  maxLength: 10,
};

function filterNumericInput(
  raw: string,
  input: ShortAnswerNumericInput,
): string {
  const { allowDecimal, allowNegative, maxLength } = input;
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]!;
    if (ch >= "0" && ch <= "9") {
      if (out.length < maxLength) out += ch;
      continue;
    }
    if (
      allowDecimal &&
      ch === "." &&
      !out.includes(".") &&
      out.length < maxLength
    ) {
      out += ch;
      continue;
    }
    if (allowNegative && ch === "-" && out.length === 0 && i === 0) {
      out += "-";
    }
  }
  return out.slice(0, maxLength);
}

type ShortAnswerNumericQuestionProps = {
  question: ShortAnswerNumericQuestionPayload;
  answer: ActivityAnswerDraft;
  onAnswerChange: (v: ActivityAnswerDraft) => void;
  submitState: SubmitPhase;
  onSubmitRequest: () => void;
  explanationMarkdown: string;
};

const ANSWER_INPUT_ID = "activity-short-answer-input";

export function ShortAnswerNumericQuestion({
  question,
  answer,
  onAnswerChange,
  submitState,
  onSubmitRequest,
  explanationMarkdown,
}: ShortAnswerNumericQuestionProps) {
  const input: ShortAnswerNumericInput =
    (question.input as ShortAnswerNumericInput | undefined) ??
    DEFAULT_NUMERIC_INPUT;
  const unitLabel = input.unit?.trim() ?? "";
  const answerText = typeof answer === "string" ? answer : "";
  const inputRef = useRef<HTMLInputElement>(null);
  const inputLocked = submitState === "submitting" || submitState === "graded";

  useEffect(() => {
    inputRef.current?.focus();
  }, [question.questionId]);

  return (
    <div className={activityStemMarkdownClassName}>
      <ContentBlockRenderer blocks={question.question} />
      <div className="space-y-2 pt-2">
        <label
          htmlFor={ANSWER_INPUT_ID}
          className="block text-base font-bold text-foreground"
        >
          Nhập câu trả lời của bạn:
        </label>
        <div className="flex flex-wrap items-center gap-2 sm:gap-x-3">
          <Input
            ref={inputRef}
            id={ANSWER_INPUT_ID}
            type="text"
            variant="bordered"
            className="min-w-0 flex-1"
            inputMode={input.allowDecimal ? "decimal" : "numeric"}
            value={answerText}
            maxLength={input.maxLength}
            autoComplete="off"
            aria-label={
              unitLabel ? `Đáp án số, đơn vị ${unitLabel}` : "Đáp án số"
            }
            placeholder="Đáp án của bạn (ví dụ: 1234567890)"
            disabled={inputLocked}
            onChange={(e) => {
              onAnswerChange(filterNumericInput(e.target.value, input) || null);
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              if (e.nativeEvent.isComposing) return;
              e.preventDefault();
              const canSubmit =
                answerText.trim().length > 0 &&
                submitState !== "submitting" &&
                submitState !== "graded";
              if (!canSubmit) return;
              void onSubmitRequest();
            }}
          />
          {unitLabel ? (
            <span className="shrink-0 text-base">{unitLabel}</span>
          ) : null}
        </div>
      </div>
      <ActivityQuestionExplanation
        submitState={submitState}
        explanationMarkdown={explanationMarkdown}
      />
    </div>
  );
}
