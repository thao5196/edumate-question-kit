"use client";

import { RadioGroup, RadioGroupCardItem } from "../ui/radio-group";
import type { TrueFalseQuestionPayload } from "../types";
import type { ActivityAnswerDraft, SubmitPhase } from "../registry/types";

import { ActivityQuestionExplanation } from "./activity-question-explanation";
import { activityStemMarkdownClassName } from "../markdown/question-markdown-shared";
import { ContentBlockRenderer } from "../content-block/content-block";

const TRUE_VALUE = "true";
const FALSE_VALUE = "false";

export function isTrueFalseSubmittable(
  _question: TrueFalseQuestionPayload,
  selected: ActivityAnswerDraft,
): boolean {
  return selected === TRUE_VALUE || selected === FALSE_VALUE;
}

type TrueFalseQuestionProps = {
  question: TrueFalseQuestionPayload;
  answer: ActivityAnswerDraft;
  onAnswerChange: (v: ActivityAnswerDraft) => void;
  submitState: SubmitPhase;
  onSubmitRequest: () => void;
  explanationMarkdown: string;
};

const TF_GROUP_PREFIX = "activity-tf-";

export function TrueFalseQuestion({
  question,
  answer,
  onAnswerChange,
  submitState,
  onSubmitRequest,
  explanationMarkdown,
}: TrueFalseQuestionProps) {
  const inputLocked = submitState === "submitting" || submitState === "graded";

  const selectedForThisQuestion =
    answer === TRUE_VALUE || answer === FALSE_VALUE ? answer : "";

  return (
    <div className={activityStemMarkdownClassName}>
      <ContentBlockRenderer blocks={question.question} />

      <div className="space-y-3 pt-4">
        <p
          className="text-base font-bold text-foreground"
          id="activity-tf-prompt"
        >
          Chọn Đúng hoặc Sai:
        </p>
        <RadioGroup
          key={question.questionId}
          className="grid gap-3"
          value={selectedForThisQuestion}
          onValueChange={(v) =>
            onAnswerChange(v === TRUE_VALUE || v === FALSE_VALUE ? v : null)
          }
          disabled={inputLocked}
          aria-labelledby="activity-tf-prompt"
          onKeyDown={(e) => {
            const isSubmitCombo = e.key === "Enter" && (e.ctrlKey || e.metaKey);
            if (!isSubmitCombo) return;
            if (e.nativeEvent.isComposing) return;
            e.preventDefault();
            const canSubmitLocal =
              isTrueFalseSubmittable(question, answer) &&
              submitState !== "submitting" &&
              submitState !== "graded";
            if (!canSubmitLocal) return;
            void onSubmitRequest();
          }}
        >
          <RadioGroupCardItem
            value={TRUE_VALUE}
            id={`${TF_GROUP_PREFIX}true`}
            letter="Đ"
            aria-label="Đúng"
          >
            <span className="text-base font-medium text-foreground">Đúng</span>
          </RadioGroupCardItem>
          <RadioGroupCardItem
            value={FALSE_VALUE}
            id={`${TF_GROUP_PREFIX}false`}
            letter="S"
            aria-label="Sai"
          >
            <span className="text-base font-medium text-foreground">Sai</span>
          </RadioGroupCardItem>
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
