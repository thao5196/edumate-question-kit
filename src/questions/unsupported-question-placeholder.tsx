import type { ActivityQuestionType } from "../types";

type UnsupportedQuestionPlaceholderProps = {
  type: ActivityQuestionType;
};

export function UnsupportedQuestionPlaceholder({
  type,
}: UnsupportedQuestionPlaceholderProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-8 text-center">
      <p className="text-base font-medium text-foreground">
        Loại câu hỏi này đang được phát triển
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Mã:{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
          {type}
        </code>
      </p>
    </div>
  );
}
