import { EquationOperator } from "../types";

/** Group digits from the right by threes; separator is ASCII space. */
export function formatIntegerWithSpaces(rawDigits: string): string {
  const d = rawDigits.replace(/\D/g, "");
  if (!d.length) return "";
  let out = "";
  let n = 0;
  for (let i = d.length - 1; i >= 0; i--) {
    if (n > 0 && n % 3 === 0) out = " " + out;
    out = d[i]! + out;
    n++;
  }
  return out;
}

export type AnswerRowCell =
  | { kind: "empty" }
  | { kind: "separator" }
  | { kind: "digit"; digitIndex: number };

/** True when formatted operands include thousands grouping spaces (not leading pad only). */
export function operandsFormattedHaveThousandsSeparator(
  formattedOperandA: string,
  formattedOperandB: string,
): boolean {
  return formattedOperandA.includes(" ") || formattedOperandB.includes(" ");
}

export function buildAnswerRowCells(
  answerDigitString: string,
  maxWidth: number,
  options?: { useThousandsSeparators?: boolean },
): AnswerRowCell[] {
  const useThousandsSeparators = options?.useThousandsSeparators ?? true;
  const digits = answerDigitString.replace(/\D/g, "");

  if (!useThousandsSeparators) {
    const pad = Math.max(0, maxWidth - digits.length);
    const cells: AnswerRowCell[] = [];
    for (let i = 0; i < pad; i++) cells.push({ kind: "empty" });
    for (let i = 0; i < digits.length; i++) {
      cells.push({ kind: "digit", digitIndex: i });
    }
    return cells;
  }

  const fmt = formatIntegerWithSpaces(digits);
  const pad = Math.max(0, maxWidth - fmt.length);
  const cells: AnswerRowCell[] = [];
  for (let i = 0; i < pad; i++) cells.push({ kind: "empty" });
  let digitIdx = 0;
  for (const ch of fmt) {
    if (ch === " ") cells.push({ kind: "separator" });
    else {
      cells.push({ kind: "digit", digitIndex: digitIdx });
      digitIdx++;
    }
  }
  return cells;
}

/** Column indices where the formatted answer renders a thousands separator (narrow grid track). */
export function answerSeparatorColumnIndices(
  answerDigitString: string,
  maxWidth: number,
): Set<number> {
  const digits = answerDigitString.replace(/\D/g, "");
  const fmt = formatIntegerWithSpaces(digits);
  const indices = new Set<number>();
  if (!fmt.includes(" ")) return indices;
  const pad = Math.max(0, maxWidth - fmt.length);
  let col = 0;
  for (let i = 0; i < pad; i++) col++;
  for (const ch of fmt) {
    if (ch === " ") {
      indices.add(col);
      col++;
    } else {
      col++;
    }
  }
  return indices;
}

/** Width tokens for CSS grid-template-columns (digit/op vs thousands separator). */
const GRID_DIGIT_COL = "minmax(3ch, 4ch)";
const GRID_THOUSANDS_SEP_COL = "minmax(2px, 0.2em)";

export function buildGridTemplateColumns(
  rowOperandTop: string[],
  padTop: number,
  answerSeparatorIndices?: ReadonlySet<number>,
): string {
  const ansSep = answerSeparatorIndices ?? new Set<number>();
  const parts: string[] = [];
  for (let i = 0; i < rowOperandTop.length; i++) {
    const ch = rowOperandTop[i];
    const isThousandsSep = (ch === " " && i >= padTop) || ansSep.has(i);
    parts.push(isThousandsSep ? GRID_THOUSANDS_SEP_COL : GRID_DIGIT_COL);
  }
  return parts.join(" ");
}

export type ColumnEquationRows = {
  maxWidth: number;
  padTop: number;
  padBottom: number;
  rowOperandTop: string[];
  rowOperandBottom: string[];
  answerUseThousandsSeparators: boolean;
};

function equationOperatorChar(operator: EquationOperator): string {
  switch (operator) {
    case "addition":
      return "+";
    case "subtraction":
      return "−";
    case "multiplication":
      return "×";
    case "division":
      return "÷";
    case "equal":
      return "=";
  }
}

export function buildColumnEquationRows(
  operandA: string,
  operandB: string,
  answerDigitString: string,
  operator: EquationOperator,
): ColumnEquationRows {
  const a = operandA.replace(/\D/g, "");
  const b = operandB.replace(/\D/g, "");
  const ans = answerDigitString.replace(/\D/g, "");
  const fmt1 = formatIntegerWithSpaces(a);
  const fmt2 = formatIntegerWithSpaces(b);
  const fmtAns = formatIntegerWithSpaces(ans);
  const opChar = equationOperatorChar(operator);
  const maxWidth = Math.max(fmt1.length, 1 + fmt2.length, fmtAns.length);

  const padTop = maxWidth - fmt1.length;
  const rowOperandTop = [...Array(padTop).fill(" "), ...fmt1.split("")];

  const padBottom = maxWidth - 1 - fmt2.length;
  const rowOperandBottom = [
    opChar,
    ...Array(padBottom).fill(" "),
    ...fmt2.split(""),
  ];
  const answerUseThousandsSeparators =
    operandsFormattedHaveThousandsSeparator(fmt1, fmt2) || fmtAns.includes(" ");

  return {
    maxWidth,
    padTop,
    padBottom,
    rowOperandTop,
    rowOperandBottom,
    answerUseThousandsSeparators,
  };
}
