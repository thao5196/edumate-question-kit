"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type KeyboardEvent,
} from "react";
import { Input } from "../ui/input";
import {
  EXPRESSION_TRANSFORMATION_BLANK_MAX_LENGTH,
  collectOrderedBlankIds,
  isExpressionTransformationDraft,
  isExpressionTransformationStepSubmittable,
  parseExpressionStepTemplate,
} from "../utils/expression-transformation-step";
import type { ExpressionTransformationStepQuestionPayload } from "../types";
import { cn } from "../utils/cn";
import type { ActivityAnswerDraft, SubmitPhase } from "../registry/types";

import { ActivityQuestionExplanation } from "./activity-question-explanation";
import { activityStemMarkdownClassName } from "../markdown/question-markdown-shared";
import { ContentBlockRenderer } from "../content-block/content-block";

type Props = {
  question: ExpressionTransformationStepQuestionPayload;
  answer: ActivityAnswerDraft;
  onAnswerChange: (v: ActivityAnswerDraft) => void;
  submitState: SubmitPhase;
  onSubmitRequest: () => void;
  explanationMarkdown: string;
};

const BLANK_INPUT_CLASS = cn(
  "mx-0.5 inline-flex field-sizing-content min-h-9 w-auto max-w-full min-w-[10rem] rounded-none border-0 border-b-2 border-dotted border-foreground/35 bg-transparent px-1 font-mono text-lg tabular-nums shadow-none outline-none",
  "focus-visible:border-solid focus-visible:border-blue-500 focus-visible:ring-0 md:text-xl",
);

export function ExpressionTransformationStepQuestion({
  question,
  answer,
  onAnswerChange,
  submitState,
  onSubmitRequest,
  explanationMarkdown,
}: Props) {
  const blankOrder = useMemo(
    () => collectOrderedBlankIds(question),
    [question],
  );
  const lastBlankId = blankOrder[blankOrder.length - 1] ?? null;
  const inputRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());

  const draft = useMemo(() => {
    if (!isExpressionTransformationDraft(answer))
      return {} as Record<string, string>;
    return { ...answer };
  }, [answer]);

  const inputLocked = submitState === "submitting" || submitState === "graded";

  // Use ref to avoid stale closure in setBlank
  const answerRef = useRef(answer);
  useEffect(() => {
    answerRef.current = answer;
  });

  const setBlank = useCallback(
    (id: string, value: string) => {
      const clipped = value.slice(
        0,
        EXPRESSION_TRANSFORMATION_BLANK_MAX_LENGTH,
      );
      const prev = answerRef.current;
      const base = isExpressionTransformationDraft(prev) ? { ...prev } : {};
      base[id] = clipped;
      const hasAny = Object.values(base).some(
        (v) => typeof v === "string" && v.trim().length > 0,
      );
      onAnswerChange(hasAny ? base : null);
    },
    [onAnswerChange],
  );

  useEffect(() => {
    const first = blankOrder[0];
    if (!first || inputLocked) return;
    const id = window.requestAnimationFrame(() => {
      inputRefs.current.get(first)?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [question.questionId, blankOrder, inputLocked]);

  const handleBlankKeyDown = useCallback(
    (blankId: string, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") return;
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      if (blankId !== lastBlankId) return;
      const prev = answerRef.current;
      const map = isExpressionTransformationDraft(prev) ? prev : {};
      const canSubmitLocal =
        isExpressionTransformationStepSubmittable(question, map) &&
        submitState !== "submitting" &&
        submitState !== "graded";
      if (!canSubmitLocal) return;
      void onSubmitRequest();
    },
    [lastBlankId, question, onSubmitRequest, submitState],
  );

  return (
    <div className={activityStemMarkdownClassName}>
      <ContentBlockRenderer blocks={question.question} />

      <div className="space-y-4 pt-4">
        <div className="px-3.5 py-3 font-mono text-lg leading-relaxed text-foreground tabular-nums md:text-xl">
          {question.expressionStem.trim()}
        </div>

        <div className="space-y-3">
          {question.steps.map((step, stepIdx) => {
            const segments = parseExpressionStepTemplate(step.template);
            return (
              <div
                key={`${question.questionId}-step-${stepIdx}`}
                className="flex flex-wrap items-center gap-x-1 gap-y-2 font-mono text-lg tabular-nums md:text-xl"
              >
                <span
                  className="inline-flex shrink-0 -translate-y-px items-center justify-center leading-none text-foreground select-none"
                  aria-hidden
                >
                  =
                </span>
                <span className="sr-only">{`Bước ${stepIdx + 1}: `}</span>
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-0 gap-y-1">
                  {segments.map((seg, segIdx) => {
                    if (seg.kind === "text") {
                      const text = seg.value;
                      if (!text) return null;
                      return (
                        <span
                          key={`t-${stepIdx}-${segIdx}`}
                          className="text-foreground"
                        >
                          {text}
                        </span>
                      );
                    }
                    const bid = seg.id;
                    return (
                      <Input
                        key={`b-${stepIdx}-${segIdx}-${bid}`}
                        ref={(el) => {
                          if (el) inputRefs.current.set(bid, el);
                          else inputRefs.current.delete(bid);
                        }}
                        type="text"
                        inputMode="text"
                        autoComplete="off"
                        aria-label={`Ô điền ${bid.replace(/^blank_/, "")}`}
                        disabled={inputLocked}
                        maxLength={EXPRESSION_TRANSFORMATION_BLANK_MAX_LENGTH}
                        value={draft[bid] ?? ""}
                        onChange={(e) => setBlank(bid, e.target.value)}
                        onKeyDown={(e) => handleBlankKeyDown(bid, e)}
                        className={BLANK_INPUT_CLASS}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          Điền đầy đủ các ô; nhấn Enter ở ô cuối để kiểm tra
        </p>
      </div>

      <ActivityQuestionExplanation
        submitState={submitState}
        explanationMarkdown={explanationMarkdown}
      />
    </div>
  );
}
