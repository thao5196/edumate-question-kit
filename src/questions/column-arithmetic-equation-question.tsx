"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { Input } from "../ui/input";
import type { ColumnArithmeticEquationQuestionPayload } from "../types";
import { cn } from "../utils/cn";
import {
  answerSeparatorColumnIndices,
  buildAnswerRowCells,
  buildColumnEquationRows,
  buildGridTemplateColumns,
} from "../utils/column-arithmetic";
import type { ActivityAnswerDraft, SubmitPhase } from "../registry/types";

import { ActivityQuestionExplanation } from "./activity-question-explanation";
import { activityStemMarkdownClassName } from "../markdown/question-markdown-shared";
import { ContentBlockRenderer } from "../content-block/content-block";

type Props = {
  question: ColumnArithmeticEquationQuestionPayload;
  answer: ActivityAnswerDraft;
  onAnswerChange: (v: ActivityAnswerDraft) => void;
  submitState: SubmitPhase;
  onSubmitRequest: () => void;
  explanationMarkdown: string;
};

type FocusDigitOptions = { selectAll?: boolean };

const CELL_H = "h-11 sm:h-12";
const DIGIT_INPUT_CLASS = cn(
  "size-full min-h-0 rounded-none border-0 bg-transparent px-1 text-center font-mono text-lg tabular-nums shadow-none",
  "focus-visible:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 md:text-xl",
);

function charAtDigit(answerText: string, i: number): string {
  const ch = answerText[i];
  return !ch || ch === " " ? "" : ch;
}

function normalizeColumnAnswerText(
  currentAnswer: unknown,
  digitCount: number,
): string {
  if (digitCount <= 0) return "";
  if (typeof currentAnswer !== "string") {
    return " ".repeat(digitCount);
  }
  if (/^[\d ]*$/.test(currentAnswer) && currentAnswer.includes(" ")) {
    const clipped =
      currentAnswer.length > digitCount
        ? currentAnswer.slice(0, digitCount)
        : currentAnswer;
    return clipped.padEnd(digitCount, " ");
  }
  if (/^\d*$/.test(currentAnswer)) {
    const clipped =
      currentAnswer.length > digitCount
        ? currentAnswer.slice(-digitCount)
        : currentAnswer;
    return clipped.padEnd(digitCount, " ");
  }
  return " ".repeat(digitCount);
}

export function ColumnArithmeticEquationQuestion({
  question,
  answer,
  onAnswerChange,
  submitState,
  onSubmitRequest,
  explanationMarkdown,
}: Props) {
  const slots = question.equation.slots;
  const filled = slots.filter((s) => !s.isBlank);
  const blank = slots.find((s) => s.isBlank)!;
  const operandA = filled[0]!.value;
  const operandB = filled[1]!.value;
  const answerTemplateDigits = blank.value;

  const {
    maxWidth,
    padTop,
    padBottom,
    rowOperandTop,
    rowOperandBottom,
    answerUseThousandsSeparators,
  } = useMemo(
    () =>
      buildColumnEquationRows(
        operandA,
        operandB,
        answerTemplateDigits,
        question.equation.operator,
      ),
    [operandA, operandB, answerTemplateDigits, question.equation.operator],
  );

  const answerRowCells = useMemo(
    () =>
      buildAnswerRowCells(answerTemplateDigits, maxWidth, {
        useThousandsSeparators: answerUseThousandsSeparators,
      }),
    [answerTemplateDigits, maxWidth, answerUseThousandsSeparators],
  );
  const firstNonEmptyIdx = useMemo(
    () => answerRowCells.findIndex((c) => c.kind !== "empty"),
    [answerRowCells],
  );

  const digitCount = answerTemplateDigits.length;

  const answerText = useMemo(
    () => normalizeColumnAnswerText(answer, digitCount),
    [answer, digitCount],
  );

  const digits = useMemo(
    () =>
      Array.from({ length: digitCount }, (_, i) => charAtDigit(answerText, i)),
    [answerText, digitCount],
  );

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const syncStoreFromDigits = useCallback(
    (nextChars: string[]) => {
      const hasDigit = nextChars.some((c) => c !== "");
      if (!hasDigit) {
        onAnswerChange(null);
        return;
      }
      const serialized = nextChars.map((c) => (c ? c : " ")).join("");
      const padded =
        serialized.length >= digitCount
          ? serialized.slice(0, digitCount)
          : serialized.padEnd(digitCount, " ");
      onAnswerChange(padded);
    },
    [digitCount, onAnswerChange],
  );

  const replaceDigitsFromAnswerString = useCallback(
    (mutate: (chars: string[]) => void) => {
      const next = Array.from({ length: digitCount }, (_, i) =>
        charAtDigit(answerText, i),
      );
      mutate(next);
      syncStoreFromDigits(next);
    },
    [answerText, digitCount, syncStoreFromDigits],
  );

  useEffect(() => {
    if (digitCount < 1) return;
    const id = requestAnimationFrame(() => {
      inputRefs.current[digitCount - 1]?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [question.questionId, digitCount]);

  const focusDigit = useCallback((di: number, opts?: FocusDigitOptions) => {
    window.requestAnimationFrame(() => {
      const el = inputRefs.current[di];
      if (!el) return;
      el.focus();
      if (opts?.selectAll) {
        window.requestAnimationFrame(() => el.select());
      }
    });
  }, []);

  const handleDigitChange = useCallback(
    (digitIndex: number, raw: string) => {
      if (raw === "") {
        replaceDigitsFromAnswerString((chars) => {
          chars[digitIndex] = "";
        });
        return;
      }
      const last = raw.slice(-1);
      if (last < "0" || last > "9") return;
      const next = Array.from({ length: digitCount }, (_, i) =>
        charAtDigit(answerText, i),
      );
      next[digitIndex] = last;
      syncStoreFromDigits(next);

      let target: number | null = null;
      if (digitIndex + 1 < digitCount && (next[digitIndex + 1] ?? "") === "") {
        target = digitIndex + 1;
      } else if (digitIndex - 1 >= 0 && (next[digitIndex - 1] ?? "") === "") {
        target = digitIndex - 1;
      }
      if (target !== null) focusDigit(target);
    },
    [
      answerText,
      digitCount,
      focusDigit,
      replaceDigitsFromAnswerString,
      syncStoreFromDigits,
    ],
  );

  const onKeyDownDigit = useCallback(
    (digitIndex: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (e.nativeEvent.isComposing) return;
        e.preventDefault();
        const joined = digits.join("");
        if (
          joined.length === digitCount &&
          digits.every((d) => d !== "") &&
          submitState !== "submitting" &&
          submitState !== "graded"
        ) {
          void onSubmitRequest();
        }
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (digitIndex > 0) focusDigit(digitIndex - 1, { selectAll: true });
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (digitIndex < digitCount - 1)
          focusDigit(digitIndex + 1, { selectAll: true });
        return;
      }
      if (e.key === "Backspace") {
        if (digits[digitIndex]) return;
        e.preventDefault();
        if (digitIndex < digitCount - 1) {
          replaceDigitsFromAnswerString((chars) => {
            chars[digitIndex + 1] = "";
          });
          focusDigit(digitIndex + 1, { selectAll: true });
        }
      }
    },
    [
      digits,
      digitCount,
      focusDigit,
      onSubmitRequest,
      replaceDigitsFromAnswerString,
      submitState,
    ],
  );

  const onPasteDigit = useCallback(
    (digitIndex: number, e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
      if (!pasted) return;
      const sliceLen = Math.min(pasted.length, digitIndex + 1);
      const slice = pasted.slice(-sliceLen);
      replaceDigitsFromAnswerString((chars) => {
        for (let k = 0; k < slice.length; k++) {
          chars[digitIndex - k] = slice[slice.length - 1 - k]!;
        }
      });
      focusDigit(Math.max(digitIndex - slice.length, 0));
    },
    [focusDigit, replaceDigitsFromAnswerString],
  );

  const answerSeparatorIndices = useMemo(
    () => answerSeparatorColumnIndices(answerTemplateDigits, maxWidth),
    [answerTemplateDigits, maxWidth],
  );

  const gridCol = useMemo(
    () => ({
      gridTemplateColumns: buildGridTemplateColumns(
        rowOperandTop,
        padTop,
        answerSeparatorIndices,
      ),
    }),
    [answerSeparatorIndices, padTop, rowOperandTop],
  );

  const inputLocked = submitState === "submitting" || submitState === "graded";

  return (
    <div className={activityStemMarkdownClassName}>
      <ContentBlockRenderer blocks={question.question} />
      <div className="flex w-full justify-center pt-4">
        <div className="inline-block max-w-full min-w-0">
          <div className="grid gap-y-0" style={gridCol}>
            {rowOperandTop.map((ch, i) => (
              <div
                key={`t-${i}`}
                className={cn(
                  CELL_H,
                  "flex items-center justify-center font-mono text-lg text-foreground tabular-nums md:text-xl",
                )}
              >
                {i < padTop ? (
                  <span className="invisible">0</span>
                ) : ch === " " ? (
                  <span className="block w-full min-w-0" aria-hidden />
                ) : (
                  ch
                )}
              </div>
            ))}
          </div>
          <div className="grid gap-y-0" style={gridCol}>
            {rowOperandBottom.map((ch, i) => (
              <div
                key={`b-${i}`}
                className={cn(
                  CELL_H,
                  "flex items-center justify-center font-mono text-lg text-foreground tabular-nums md:text-xl",
                )}
              >
                {i === 0 ? (
                  <span className="font-semibold">{ch}</span>
                ) : i > 0 && i <= padBottom ? (
                  <span className="invisible">0</span>
                ) : ch === " " ? (
                  <span className="block w-full min-w-0" aria-hidden />
                ) : (
                  ch
                )}
              </div>
            ))}
          </div>
          <div
            className="my-2 h-0.5 w-full bg-foreground"
            role="presentation"
            aria-hidden
          />
          <div className="grid gap-y-0" style={gridCol}>
            {answerRowCells.map((cell, colIdx) => {
              if (cell.kind === "empty") return null;
              const isFirst = colIdx === firstNonEmptyIdx;
              const isLast = colIdx === answerRowCells.length - 1;
              const colStyle =
                isFirst && colIdx > 0
                  ? { gridColumnStart: colIdx + 1 }
                  : undefined;

              const cellBorder = cn(
                "border-t border-b border-foreground/20 bg-background dark:bg-input/30",
                isFirst && "rounded-l-md border-l",
                isLast
                  ? "rounded-r-md border-r border-foreground/20"
                  : "border-foreground/15",
              );

              if (cell.kind === "separator") {
                return (
                  <div
                    key={`a-${colIdx}`}
                    style={{
                      ...colStyle,
                      borderRight: "dashed 1px var(--input)",
                    }}
                    className={cn(
                      CELL_H,
                      cellBorder,
                      "flex items-center justify-center font-mono text-lg text-foreground md:text-xl",
                    )}
                    aria-hidden
                  >
                    <span className="block w-full min-w-0" />
                  </div>
                );
              }
              const di = cell.digitIndex;
              return (
                <div
                  key={`a-${colIdx}`}
                  style={{
                    ...colStyle,
                    borderRight: isLast ? "" : "dashed 1px var(--input)",
                  }}
                  className={cn(CELL_H, cellBorder, "min-w-0 p-0")}
                >
                  <Input
                    ref={(el) => {
                      inputRefs.current[di] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={1}
                    disabled={inputLocked}
                    aria-label={`Chữ số thứ ${di + 1} trong đáp án`}
                    className={DIGIT_INPUT_CLASS}
                    value={digits[di] ?? ""}
                    onChange={(e) => handleDigitChange(di, e.target.value)}
                    onKeyDown={(e) => onKeyDownDigit(di, e)}
                    onPaste={(e) => onPasteDigit(di, e)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <ActivityQuestionExplanation
        submitState={submitState}
        explanationMarkdown={explanationMarkdown}
      />
    </div>
  );
}
