import type { NextQuestionResponse, SubmitAnswerResponseValue } from "../types";

export type SubmitPhase = "idle" | "submitting" | "graded" | "error";

export type ActivityAnswerDraft =
  | string
  | string[]
  | Record<string, string>
  | null;

export type QuestionViewComponentProps = {
  model: unknown;
  answer: ActivityAnswerDraft;
  onAnswerChange: (v: ActivityAnswerDraft) => void;
  submitState: SubmitPhase;
  onSubmitRequest: () => void;
  explanationMarkdown: string;
};

export type QuestionRegistryEntry = {
  parse: (q: NextQuestionResponse) => unknown | null;
  canSubmit: (model: unknown, answer: ActivityAnswerDraft) => boolean;
  toSubmitPayload: (
    model: unknown,
    answer: ActivityAnswerDraft,
  ) => SubmitAnswerResponseValue | null;
  invalidShapeTitle: string;
  invalidShapeDescription: string;
};
