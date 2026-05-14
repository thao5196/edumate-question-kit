"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import type { ActivityAnswerDraft, SubmitPhase } from "../registry/types";
import type {
  ColumnArithmeticMultiStepQuestionPayload,
  EquationOperator,
} from "../types";
import { Input } from "../ui/input";
import { cn } from "../utils/cn";
import {
  buildAnswerRowCells,
  formatIntegerWithSpaces,
} from "../utils/column-arithmetic";

import { ContentBlockRenderer } from "../content-block/content-block";
import { activityStemMarkdownClassName } from "../markdown/question-markdown-shared";

const CELL_H = "h-11 sm:h-12";
const GRID_DIGIT_COL = "minmax(3ch, 4ch)";
const GRID_THOUSANDS_SEP_COL = "minmax(2px, 0.2em)";
const DIGIT_INPUT_CLASS = cn(
  "size-full min-h-0 rounded-none border-0 bg-transparent px-1 text-center font-mono text-lg tabular-nums shadow-none",
  "focus-visible:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 md:text-xl",
);

function opChar(op: EquationOperator | string): string {
  switch (op) {
    case "addition":
      return "+";
    case "subtraction":
      return "−";
    case "multiplication":
      return "×";
    case "division":
      return "÷";
    default:
      return "";
  }
}

function getTrailingAutoZeros(operator: string, slotIdx: number): number {
  return operator === "addition" ? slotIdx : 0;
}

function normalizeSlotAnswer(val: string | undefined, len: number): string {
  if (len <= 0) return "";
  if (typeof val !== "string" || !val) return " ".repeat(len);
  if (/^[\d ]*$/.test(val) && val.includes(" ")) {
    return (val.length > len ? val.slice(0, len) : val).padEnd(len, " ");
  }
  if (/^\d*$/.test(val)) {
    return (val.length > len ? val.slice(-len) : val).padEnd(len, " ");
  }
  return " ".repeat(len);
}

function charAtDigit(s: string, i: number): string {
  const ch = s[i];
  return !ch || ch === " " ? "" : ch;
}

type BlankSlotRef = {
  slotKey: string;
  digitCount: number;
  editableLen: number;
};

type Props = {
  question: ColumnArithmeticMultiStepQuestionPayload;
  answer: ActivityAnswerDraft;
  onAnswerChange: (v: ActivityAnswerDraft) => void;
  submitState: SubmitPhase;
  onSubmitRequest: () => void;
};

export function ColumnArithmeticMultiStepQuestion({
  question,
  answer,
  onAnswerChange,
  submitState,
  onSubmitRequest,
}: Props) {
  const inputLocked = submitState === "submitting" || submitState === "graded";

  const answerRecord = useMemo((): Record<string, string> => {
    if (
      answer != null &&
      typeof answer === "object" &&
      !Array.isArray(answer)
    ) {
      return answer as Record<string, string>;
    }
    return {};
  }, [answer]);

  const currentAnswerRef = useRef(answer);
  useEffect(() => {
    currentAnswerRef.current = answer;
  });

  const formattedMaxWidth = useMemo(() => {
    let max = 0;
    for (const step of question.steps) {
      for (const slot of step.equation.slots) {
        const fmt = formatIntegerWithSpaces(slot.value.replace(/\D/g, ""));
        if (fmt.length > max) max = fmt.length;
      }
    }
    return max;
  }, [question]);

  const globalSeparatorSet = useMemo((): Set<number> => {
    const set = new Set<number>();
    for (let pos = formattedMaxWidth - 4; pos >= 0; pos -= 4) {
      set.add(pos);
    }
    return set;
  }, [formattedMaxWidth]);

  const trailingZerosMap = useMemo((): Record<string, number> => {
    const map: Record<string, number> = {};
    for (const step of question.steps) {
      step.equation.slots.forEach((slot, slotIdx) => {
        const tz = getTrailingAutoZeros(step.equation.operator, slotIdx);
        if (slot.isBlank && tz > 0) map[slot.key] = tz;
      });
    }
    return map;
  }, [question]);

  const blankSlots = useMemo((): BlankSlotRef[] => {
    const result: BlankSlotRef[] = [];
    for (const step of question.steps) {
      step.equation.slots.forEach((slot, slotIdx) => {
        if (!slot.isBlank) return;
        const trailingZeros = getTrailingAutoZeros(
          step.equation.operator,
          slotIdx,
        );
        result.push({
          slotKey: slot.key,
          digitCount: slot.value.length,
          editableLen: slot.value.length - trailingZeros,
        });
      });
    }
    return result;
  }, [question]);

  const gridStyle = useMemo(() => {
    const parts: string[] = [GRID_DIGIT_COL];
    for (let i = 0; i < formattedMaxWidth; i++) {
      parts.push(
        globalSeparatorSet.has(i) ? GRID_THOUSANDS_SEP_COL : GRID_DIGIT_COL,
      );
    }
    return { gridTemplateColumns: parts.join(" ") };
  }, [formattedMaxWidth, globalSeparatorSet]);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const focusDigit = useCallback(
    (slotKey: string, di: number, selectAll?: boolean) => {
      window.requestAnimationFrame(() => {
        const el = inputRefs.current[`${slotKey}:${di}`];
        if (!el) return;
        el.focus();
        if (selectAll) window.requestAnimationFrame(() => el.select());
      });
    },
    [],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const first = blankSlots[0];
      if (first) focusDigit(first.slotKey, first.editableLen - 1);
    });
    return () => cancelAnimationFrame(id);
  }, [question.questionId, blankSlots, focusDigit]);

  // Auto-initialize trailing zeros
  useEffect(() => {
    if (Object.keys(trailingZerosMap).length === 0) return;
    const prev =
      currentAnswerRef.current != null &&
      typeof currentAnswerRef.current === "object" &&
      !Array.isArray(currentAnswerRef.current)
        ? { ...(currentAnswerRef.current as Record<string, string>) }
        : ({} as Record<string, string>);

    let changed = false;
    const next = { ...prev };

    for (const step of question.steps) {
      step.equation.slots.forEach((slot, slotIdx) => {
        if (!slot.isBlank) return;
        const trailingZeros = getTrailingAutoZeros(
          step.equation.operator,
          slotIdx,
        );
        if (trailingZeros === 0) return;
        const len = slot.value.length;
        const editableLen = len - trailingZeros;
        const existing = prev[slot.key];
        const answerText = normalizeSlotAnswer(existing, len);
        const chars = Array.from({ length: len }, (_, i) =>
          i >= editableLen ? "0" : charAtDigit(answerText, i),
        );
        const serialized = chars.map((c) => c || " ").join("");
        if (serialized !== existing) {
          next[slot.key] = serialized;
          changed = true;
        }
      });
    }

    if (changed) onAnswerChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.questionId]);

  const syncSlotDigits = useCallback(
    (slotKey: string, len: number, nextChars: string[]) => {
      const prevRecord =
        answer != null && typeof answer === "object" && !Array.isArray(answer)
          ? { ...(answer as Record<string, string>) }
          : ({} as Record<string, string>);
      const hasDigit = nextChars.some((c) => c !== "");
      if (!hasDigit) {
        const next = { ...prevRecord };
        delete next[slotKey];
        onAnswerChange(Object.keys(next).length === 0 ? null : next);
        return;
      }
      const serialized = nextChars
        .map((c) => c || " ")
        .join("")
        .slice(0, len)
        .padEnd(len, " ");
      onAnswerChange({ ...prevRecord, [slotKey]: serialized });
    },
    [answer, onAnswerChange],
  );

  const handleDigitChange = useCallback(
    (slotKey: string, len: number, di: number, raw: string) => {
      const trailingZeros = trailingZerosMap[slotKey] ?? 0;
      const editableLen = len - trailingZeros;
      const answerText = normalizeSlotAnswer(answerRecord[slotKey], len);
      const editableChars = Array.from({ length: editableLen }, (_, i) =>
        charAtDigit(answerText, i),
      );
      if (raw === "") {
        editableChars[di] = "";
        syncSlotDigits(slotKey, len, [
          ...editableChars,
          ...Array(trailingZeros).fill("0"),
        ]);
        return;
      }
      const last = raw.slice(-1);
      if (last < "0" || last > "9") return;
      editableChars[di] = last;
      syncSlotDigits(slotKey, len, [
        ...editableChars,
        ...Array(trailingZeros).fill("0"),
      ]);
      if (di + 1 < editableLen && (editableChars[di + 1] ?? "") === "") {
        focusDigit(slotKey, di + 1);
      } else if (di - 1 >= 0 && (editableChars[di - 1] ?? "") === "") {
        focusDigit(slotKey, di - 1);
      }
      const allFilled = editableChars.every((c) => c !== "");
      if (allFilled) {
        const idx = blankSlots.findIndex((s) => s.slotKey === slotKey);
        const next = blankSlots[idx + 1];
        if (next) focusDigit(next.slotKey, next.editableLen - 1);
      }
    },
    [answerRecord, blankSlots, focusDigit, syncSlotDigits, trailingZerosMap],
  );

  const handleKeyDown = useCallback(
    (
      slotKey: string,
      len: number,
      di: number,
      e: KeyboardEvent<HTMLInputElement>,
    ) => {
      const trailingZeros = trailingZerosMap[slotKey] ?? 0;
      const editableLen = len - trailingZeros;

      if (e.key === "Enter") {
        if (e.nativeEvent.isComposing) return;
        e.preventDefault();
        void onSubmitRequest();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (di > 0) {
          focusDigit(slotKey, di - 1, true);
        } else {
          const idx = blankSlots.findIndex((s) => s.slotKey === slotKey);
          const prev = blankSlots[idx - 1];
          if (prev) focusDigit(prev.slotKey, 0, true);
        }
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (di < editableLen - 1) {
          focusDigit(slotKey, di + 1, true);
        } else {
          const idx = blankSlots.findIndex((s) => s.slotKey === slotKey);
          const next = blankSlots[idx + 1];
          if (next) focusDigit(next.slotKey, 0, true);
        }
        return;
      }
      if (e.key === "Backspace") {
        const answerText = normalizeSlotAnswer(answerRecord[slotKey], len);
        if (charAtDigit(answerText, di)) return;
        e.preventDefault();
        const editableChars = Array.from({ length: editableLen }, (_, i) =>
          charAtDigit(answerText, i),
        );
        if (di < editableLen - 1) {
          editableChars[di + 1] = "";
          syncSlotDigits(slotKey, len, [
            ...editableChars,
            ...Array(trailingZeros).fill("0"),
          ]);
          focusDigit(slotKey, di + 1, true);
        } else if (di > 0) {
          editableChars[di - 1] = "";
          syncSlotDigits(slotKey, len, [
            ...editableChars,
            ...Array(trailingZeros).fill("0"),
          ]);
          focusDigit(slotKey, di - 1, true);
        }
      }
    },
    [
      answerRecord,
      blankSlots,
      focusDigit,
      onSubmitRequest,
      syncSlotDigits,
      trailingZerosMap,
    ],
  );

  const handlePaste = useCallback(
    (
      slotKey: string,
      len: number,
      di: number,
      e: ClipboardEvent<HTMLInputElement>,
    ) => {
      const trailingZeros = trailingZerosMap[slotKey] ?? 0;
      const editableLen = len - trailingZeros;
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
      if (!pasted) return;
      const answerText = normalizeSlotAnswer(answerRecord[slotKey], len);
      const editableChars = Array.from({ length: editableLen }, (_, i) =>
        charAtDigit(answerText, i),
      );
      const sliceLen = Math.min(pasted.length, di + 1);
      const slice = pasted.slice(-sliceLen);
      for (let k = 0; k < slice.length; k++) {
        editableChars[di - k] = slice[slice.length - 1 - k]!;
      }
      syncSlotDigits(slotKey, len, [
        ...editableChars,
        ...Array(trailingZeros).fill("0"),
      ]);
      focusDigit(slotKey, Math.max(di - slice.length, 0));
    },
    [answerRecord, focusDigit, syncSlotDigits, trailingZerosMap],
  );

  return (
    <div className={activityStemMarkdownClassName}>
      <ContentBlockRenderer blocks={question.question} />

      <div className="flex w-full flex-col items-center pt-4">
        <div className="inline-block max-w-full min-w-0">
          {question.steps.map((stepData, stepIdx) => (
            <div key={stepIdx} className="space-y-1">
              {stepIdx > 0 && (
                <div
                  className="my-1 h-0.5 w-full bg-foreground"
                  role="presentation"
                  aria-hidden
                />
              )}

              {stepData.equation.slots.map((slot, slotIdx) => {
                const len = slot.value.length;
                const op =
                  slotIdx > 0 ? opChar(stepData.equation.operator) : "";
                const trailingZeros = getTrailingAutoZeros(
                  stepData.equation.operator,
                  slotIdx,
                );
                const editableLen = slot.isBlank ? len - trailingZeros : len;

                const rawVal = slot.isBlank
                  ? answerRecord[slot.key]
                  : slot.value;
                const answerText = normalizeSlotAnswer(rawVal, len);

                const slotCells = buildAnswerRowCells(
                  slot.value,
                  formattedMaxWidth,
                  { useThousandsSeparators: true },
                );
                const firstNonEmptyIdx = slotCells.findIndex(
                  (c) => c.kind !== "empty",
                );

                return (
                  <div
                    key={slot.key}
                    className="grid gap-y-0"
                    style={gridStyle}
                  >
                    <div
                      className={cn(
                        CELL_H,
                        "flex items-center justify-center font-mono text-lg font-semibold text-foreground tabular-nums md:text-xl",
                      )}
                    >
                      {op || (
                        <span className="block w-full min-w-0" aria-hidden />
                      )}
                    </div>

                    {slotCells.map((cell, cellIdx) => {
                      if (cell.kind === "empty") {
                        return (
                          <div
                            key={`empty-${cellIdx}`}
                            className={cn(
                              CELL_H,
                              "flex items-center justify-center",
                            )}
                            aria-hidden
                          />
                        );
                      }

                      if (!slot.isBlank) {
                        if (cell.kind === "separator") {
                          return (
                            <div
                              key={`sep-${cellIdx}`}
                              className={CELL_H}
                              aria-hidden
                            />
                          );
                        }
                        const ch = charAtDigit(answerText, cell.digitIndex);
                        return (
                          <div
                            key={`d-${cellIdx}`}
                            className={cn(
                              CELL_H,
                              "flex items-center justify-center font-mono text-lg text-foreground tabular-nums md:text-xl",
                            )}
                          >
                            {ch || (
                              <span
                                className="block w-full min-w-0"
                                aria-hidden
                              />
                            )}
                          </div>
                        );
                      }

                      const isFirst = cellIdx === firstNonEmptyIdx;
                      const isLast = cellIdx === slotCells.length - 1;
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
                            key={`sep-${cellIdx}`}
                            style={{ borderRight: "dashed 1px var(--input)" }}
                            className={cn(
                              CELL_H,
                              cellBorder,
                              "flex items-center justify-center",
                            )}
                            aria-hidden
                          />
                        );
                      }

                      const di = cell.digitIndex;
                      const isTrailingZero = di >= editableLen;

                      if (isTrailingZero) {
                        return (
                          <div
                            key={`d-${cellIdx}`}
                            style={{
                              borderRight: isLast
                                ? undefined
                                : "dashed 1px var(--input)",
                            }}
                            className={cn(
                              CELL_H,
                              cellBorder,
                              inputLocked && "bg-input/50 opacity-50",
                              "flex items-center justify-center font-mono text-lg font-semibold text-muted-foreground tabular-nums md:text-xl",
                            )}
                            aria-label="Chữ số 0 tự động"
                          >
                            0
                          </div>
                        );
                      }

                      const ch = charAtDigit(answerText, di);
                      return (
                        <div
                          key={`d-${cellIdx}`}
                          style={{
                            borderRight: isLast
                              ? undefined
                              : "dashed 1px var(--input)",
                          }}
                          className={cn(CELL_H, cellBorder, "min-w-0 p-0")}
                        >
                          <Input
                            ref={(el) => {
                              inputRefs.current[`${slot.key}:${di}`] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            maxLength={1}
                            disabled={inputLocked}
                            aria-label={`Chữ số thứ ${di + 1} trong ô trống`}
                            className={DIGIT_INPUT_CLASS}
                            value={ch}
                            onChange={(e) =>
                              handleDigitChange(
                                slot.key,
                                len,
                                di,
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(slot.key, len, di, e)
                            }
                            onPaste={(e) => handlePaste(slot.key, len, di, e)}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Enter để kiểm tra.
      </p>
    </div>
  );
}
