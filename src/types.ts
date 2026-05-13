// ─── Activity Question Types ───────────────────────────────────────────────────

export type ActivityQuestionType =
  | "short_answer_numeric"
  | "short_answer_text"
  | "multiple_choice"
  | "multiple_response"
  | "true_false"
  | "drag_drop_order"
  | "column_arithmetic_equation"
  | "column_arithmetic_multi_step"
  | "expression_transformation_step"
  | (string & {});

export type ActivityQuestionTextSegment = {
  id: string;
  type: "text";
  text: string;
};
export type ActivityQuestionSegment = ActivityQuestionTextSegment;

export type MultipleChoiceOption = {
  id: string;
  content: ActivityQuestionSegment[];
};

export type DragDropOrderItem = MultipleChoiceOption;

export type EquationOperator =
  | "addition"
  | "subtraction"
  | "multiplication"
  | "division"
  | "equal";

export type EquationSlot = {
  key: string;
  value: string;
  isBlank: boolean;
};

export type ColumnArithmeticEquationData = {
  operator: EquationOperator;
  slots: EquationSlot[];
};

export type ColumnArithmeticMultiStepData = {
  equation: ColumnArithmeticEquationData;
};

export type ExpressionTransformationBlankRef = {
  id: string;
};

export type ExpressionTransformationStep = {
  template: string;
  blanks: ExpressionTransformationBlankRef[];
};

export type ShortAnswerNumericInput = {
  allowDecimal: boolean;
  allowNegative: boolean;
  maxLength: number;
  unit?: string | null;
};

export type ShortAnswerNumericValidation = {
  required: boolean;
  min: number | null;
  max: number | null;
};

export type ShortAnswerTextInput = {
  maxLength: number;
  trimWhitespace: boolean;
  caseInsensitive: boolean;
};

export type ShortAnswerTextValidation = {
  required: boolean;
  minLength: number | null;
  maxLength: number | null;
};

type NextQuestionResponseBase = {
  id: string;
  questionId: string;
  question: ActivityQuestionSegment[];
  difficulty: string;
  bloom: string;
  walkthrough: unknown;
  wrapUp: unknown;
  concepts: unknown[];
  createdAt: string;
  updatedAt: string;
};

export type NextQuestionResponse = NextQuestionResponseBase & {
  type: ActivityQuestionType;
  input?: ShortAnswerNumericInput | ShortAnswerTextInput;
  validation?: ShortAnswerNumericValidation | ShortAnswerTextValidation;
  options?: MultipleChoiceOption[];
  items?: DragDropOrderItem[];
  correctOrder?: string[];
  equation?: ColumnArithmeticEquationData;
  expressionStem?: string;
  steps?: ExpressionTransformationStep[] | ColumnArithmeticMultiStepData[];
};

// ─── Narrowed Payload Types ────────────────────────────────────────────────────

export type ShortAnswerNumericQuestionPayload = NextQuestionResponse & {
  type: "short_answer_numeric";
};

export type ShortAnswerTextQuestionPayload = NextQuestionResponse & {
  type: "short_answer_text";
};

export type MultipleChoiceQuestionPayload = NextQuestionResponse & {
  type: "multiple_choice";
  options: MultipleChoiceOption[];
};

export type MultipleResponseQuestionPayload = NextQuestionResponse & {
  type: "multiple_response";
  options: MultipleChoiceOption[];
};

export type DragDropOrderQuestionPayload = NextQuestionResponse & {
  type: "drag_drop_order";
  items: DragDropOrderItem[];
};

export type ColumnArithmeticEquationQuestionPayload = NextQuestionResponse & {
  type: "column_arithmetic_equation";
  equation: ColumnArithmeticEquationData;
};

export type ExpressionTransformationStepQuestionPayload =
  NextQuestionResponse & {
    type: "expression_transformation_step";
    expressionStem: string;
    steps: ExpressionTransformationStep[];
  };

export type ColumnArithmeticMultiStepQuestionPayload = Omit<
  NextQuestionResponse,
  "steps"
> & {
  type: "column_arithmetic_multi_step";
  steps: ColumnArithmeticMultiStepData[];
};

export type TrueFalseQuestionPayload = NextQuestionResponse & {
  type: "true_false";
};

// ─── Type Guards ───────────────────────────────────────────────────────────────

function stemTextFromQuestionSegments(
  segments: ActivityQuestionSegment[],
): string {
  return segments
    .filter((s) => s.type === "text")
    .map((s) => s.text)
    .join("\n\n");
}

export function isTrueFalseQuestion(
  q: NextQuestionResponse | null | undefined,
): q is TrueFalseQuestionPayload {
  if (q == null || q.type !== "true_false") return false;
  if (!Array.isArray(q.question)) return false;
  return stemTextFromQuestionSegments(q.question).trim().length > 0;
}

export function isShortAnswerNumericQuestion(
  q: NextQuestionResponse | null | undefined,
): q is ShortAnswerNumericQuestionPayload {
  return q != null && q.type === "short_answer_numeric";
}

export function isShortAnswerTextQuestion(
  q: NextQuestionResponse | null | undefined,
): q is ShortAnswerTextQuestionPayload {
  return q != null && q.type === "short_answer_text";
}

export function isMultipleChoiceQuestion(
  q: NextQuestionResponse | null | undefined,
): q is MultipleChoiceQuestionPayload {
  return (
    q != null &&
    q.type === "multiple_choice" &&
    Array.isArray(q.options) &&
    q.options.length > 0
  );
}

export function isMultipleResponseQuestion(
  q: NextQuestionResponse | null | undefined,
): q is MultipleResponseQuestionPayload {
  return (
    q != null &&
    q.type === "multiple_response" &&
    Array.isArray(q.options) &&
    q.options.length > 0
  );
}

export function isDragDropOrderQuestion(
  q: NextQuestionResponse | null | undefined,
): q is DragDropOrderQuestionPayload {
  if (
    q == null ||
    q.type !== "drag_drop_order" ||
    !Array.isArray(q.items) ||
    q.items.length === 0
  ) {
    return false;
  }
  return q.items.every((it) => typeof it?.id === "string" && it.id.length > 0);
}

const DIGITS_ONLY = /^\d+$/;

function isEquationSlotValid(s: unknown): s is EquationSlot {
  if (s == null || typeof s !== "object") return false;
  const o = s as Record<string, unknown>;
  return (
    typeof o.key === "string" &&
    o.key.length > 0 &&
    typeof o.value === "string" &&
    typeof o.isBlank === "boolean"
  );
}

function idsFromTemplatesInOrder(template: string): string[] {
  const matches = [...template.matchAll(/\[\[([^\]]+)\]\]/g)];
  return matches.map((m) => m[1]!.trim());
}

function multisetStringsEqual(
  left: readonly string[],
  right: readonly string[],
): boolean {
  if (left.length !== right.length) return false;
  const a = [...left].sort((x, y) => x.localeCompare(y));
  const b = [...right].sort((x, y) => x.localeCompare(y));
  return a.every((v, i) => v === b[i]);
}

function isExpressionStepShapeValid(
  step: unknown,
): step is ExpressionTransformationStep {
  if (step == null || typeof step !== "object") return false;
  const o = step as Record<string, unknown>;
  if (typeof o.template !== "string") return false;
  if (!Array.isArray(o.blanks)) return false;
  const blankIds = o.blanks.map((b) =>
    b != null &&
    typeof b === "object" &&
    typeof (b as { id?: unknown }).id === "string"
      ? (b as { id: string }).id.trim()
      : "",
  );
  if (blankIds.some((id) => id.length === 0)) return false;
  const fromTpl = idsFromTemplatesInOrder(o.template);
  if (fromTpl.some((id) => id.length === 0)) return false;
  if (fromTpl.length === 0) return false;
  const uniqueInTpl = new Set(fromTpl);
  if (uniqueInTpl.size !== fromTpl.length) return false;
  return multisetStringsEqual(blankIds, fromTpl);
}

export function isExpressionTransformationStepQuestion(
  q: NextQuestionResponse | null | undefined,
): q is ExpressionTransformationStepQuestionPayload {
  if (q == null || q.type !== "expression_transformation_step") return false;
  if (
    typeof q.expressionStem !== "string" ||
    q.expressionStem.trim().length === 0
  )
    return false;
  const { steps } = q;
  if (!Array.isArray(steps) || steps.length === 0) return false;
  return steps.every(isExpressionStepShapeValid);
}

export function isColumnArithmeticEquationQuestion(
  q: NextQuestionResponse | null | undefined,
): q is ColumnArithmeticEquationQuestionPayload {
  if (
    q == null ||
    q.type !== "column_arithmetic_equation" ||
    q.equation == null
  )
    return false;
  const { operator, slots } = q.equation;
  const validOperator =
    operator === "addition" ||
    operator === "subtraction" ||
    operator === "multiplication" ||
    operator === "division";
  if (!validOperator) return false;
  if (!Array.isArray(slots) || slots.length !== 3) return false;
  if (!slots.every(isEquationSlotValid)) return false;
  const blanks = slots.filter((s) => s.isBlank);
  if (blanks.length !== 1) return false;
  if (!DIGITS_ONLY.test(blanks[0]!.value)) return false;
  const filled = slots.filter((s) => !s.isBlank);
  if (filled.length !== 2) return false;
  if (!filled.every((s) => DIGITS_ONLY.test(s.value))) return false;
  return true;
}

export function isColumnArithmeticEquationSubmittable(
  q: ColumnArithmeticEquationQuestionPayload,
  answer: string | null | undefined,
): boolean {
  const blank = q.equation.slots.find((s) => s.isBlank);
  if (!blank) return false;
  const expectedLen = blank.value.length;
  if (typeof answer !== "string" || answer.length !== expectedLen) return false;
  if (!DIGITS_ONLY.test(answer)) return false;
  const n = Number(answer);
  return !Number.isNaN(n);
}

function isColumnArithmeticMultiStepEquationDataValid(
  equation: unknown,
): boolean {
  if (equation == null || typeof equation !== "object") return false;
  const eq = equation as Record<string, unknown>;
  const validOps = [
    "addition",
    "subtraction",
    "multiplication",
    "division",
    "equal",
  ];
  if (!validOps.includes(eq.operator as string)) return false;
  if (!Array.isArray(eq.slots) || eq.slots.length === 0) return false;
  const slots = eq.slots as unknown[];
  if (!slots.every(isEquationSlotValid)) return false;
  return (slots as EquationSlot[])
    .filter((s) => s.isBlank)
    .every((s) => DIGITS_ONLY.test(s.value));
}

export function isColumnArithmeticMultiStepQuestion(
  q: NextQuestionResponse | null | undefined,
): q is ColumnArithmeticMultiStepQuestionPayload {
  if (q == null || q.type !== "column_arithmetic_multi_step") return false;
  if (!Array.isArray(q.steps) || q.steps.length === 0) return false;
  return (q.steps as unknown[]).every(
    (step) =>
      step != null &&
      typeof step === "object" &&
      isColumnArithmeticMultiStepEquationDataValid(
        (step as Record<string, unknown>).equation,
      ),
  );
}

export function isColumnArithmeticMultiStepSubmittable(
  q: ColumnArithmeticMultiStepQuestionPayload,
  answer: Record<string, string> | null | undefined,
): boolean {
  if (answer == null || typeof answer !== "object" || Array.isArray(answer))
    return false;
  for (const step of q.steps) {
    for (const slot of step.equation.slots) {
      if (!slot.isBlank) continue;
      const val = answer[slot.key];
      if (typeof val !== "string" || val.length !== slot.value.length)
        return false;
      if (!DIGITS_ONLY.test(val)) return false;
    }
  }
  return true;
}

// ─── Submit Payload Types ──────────────────────────────────────────────────────

export type SubmitAnswerResponseValue =
  | { type: "short_answer_numeric"; value: number }
  | { type: "short_answer_text"; value: string }
  | { type: "multiple_choice"; selectedOptionId: string }
  | { type: "multiple_response"; selectedOptionIds: string[] }
  | { type: "true_false"; value: boolean }
  | { type: "drag_drop_order"; orderedIds: string[] }
  | { type: "column_arithmetic_equation"; value: number }
  | {
      type: "expression_transformation_step";
      blankAnswers: Record<string, string>;
    }
  | {
      type: "column_arithmetic_multi_step";
      slotAnswers: Record<string, number>;
    }
  | (Record<string, unknown> & { type: string });
