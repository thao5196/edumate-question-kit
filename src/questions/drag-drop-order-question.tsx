"use client";

import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useEffect, useMemo, type ReactNode } from "react";
import type { ActivityAnswerDraft, SubmitPhase } from "../registry/types";
import type { DragDropOrderQuestionPayload } from "../types";
import { cn } from "../utils/cn";

import { ContentBlockRenderer } from "../content-block/content-block";
import {
  activityStemMarkdownClassName,
  coarsePlainTextFromMarkdown,
  concatTextFromSegments,
} from "../markdown/question-markdown-shared";

export type DragDropOrderQuestionModel = DragDropOrderQuestionPayload;

function sortedIdsCopy(ids: string[]): string[] {
  return [...ids].sort();
}

export function isDragDropOrderSubmittable(
  question: DragDropOrderQuestionModel,
  orderedIds: string[] | null | undefined,
): boolean {
  if (!orderedIds || orderedIds.length !== question.items.length) return false;
  const expected = sortedIdsCopy(question.items.map((i) => i.id));
  const got = sortedIdsCopy(orderedIds);
  if (expected.length !== got.length) return false;
  for (let i = 0; i < expected.length; i++) {
    if (expected[i] !== got[i]) return false;
  }
  return true;
}

type SortableItemProps = {
  id: string;
  position: number;
  disabled: boolean;
  rowAriaLabel: string;
  children: ReactNode;
};

function SortableItem({
  id,
  position,
  disabled,
  rowAriaLabel,
  children,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      aria-label={rowAriaLabel}
      {...listeners}
      className={cn(
        "flex w-full min-w-0 cursor-grab touch-none rounded-xl border-2 border-border bg-background px-4 py-4 select-none",
        "items-center gap-4 transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out",
        "motion-safe:active:scale-[0.99] motion-reduce:transition-none",
        "hover:bg-gray-50/80 dark:hover:bg-blue-950/30",
        "outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        disabled && "pointer-events-none cursor-not-allowed opacity-60",
        !disabled && "active:cursor-grabbing",
        isDragging &&
          cn(
            "z-10 cursor-grabbing border-[3px] border-blue-500/80 opacity-95 shadow-lg",
            "motion-safe:scale-[1.01] motion-reduce:scale-100",
          ),
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-foreground tabular-nums",
          "bg-gray-200/80 transition-[color,background-color] duration-200 ease-out motion-reduce:transition-none",
          "dark:bg-muted/80",
        )}
        aria-hidden
      >
        {position}
      </span>
      <div className="min-w-0 flex-1 text-base leading-relaxed text-foreground">
        {children}
      </div>
      <span
        className="pointer-events-none shrink-0 text-muted-foreground"
        aria-hidden
      >
        <GripVertical className="size-5" />
      </span>
    </div>
  );
}

type DragDropOrderQuestionProps = {
  question: DragDropOrderQuestionModel;
  answer: ActivityAnswerDraft;
  onAnswerChange: (v: ActivityAnswerDraft) => void;
  submitState: SubmitPhase;
  onSubmitRequest: () => void;
};

export function DragDropOrderQuestion({
  question,
  answer,
  onAnswerChange,
  submitState,
  onSubmitRequest,
}: DragDropOrderQuestionProps) {
  const inputLocked = submitState === "submitting" || submitState === "graded";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const baselineIds = useMemo(
    () => question.items.map((i) => i.id),
    [question],
  );

  useEffect(() => {
    onAnswerChange(baselineIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baselineIds.join(",")]);

  const orderedIds = useMemo(() => {
    if (Array.isArray(answer) && answer.length === question.items.length) {
      return answer as string[];
    }
    return baselineIds;
  }, [answer, baselineIds, question]);

  const itemById = useMemo(() => {
    const m = new Map<string, (typeof question.items)[number]>();
    for (const it of question.items) m.set(it.id, it);
    return m;
  }, [question]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedIds.indexOf(String(active.id));
    const newIndex = orderedIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onAnswerChange(arrayMove(orderedIds, oldIndex, newIndex));
  };

  return (
    <div className={activityStemMarkdownClassName}>
      <ContentBlockRenderer blocks={question.question} />
      <div
        className="space-y-3 pt-4"
        onKeyDown={(e) => {
          const isSubmitCombo = e.key === "Enter" && (e.ctrlKey || e.metaKey);
          if (!isSubmitCombo) return;
          if (e.nativeEvent.isComposing) return;
          e.preventDefault();
          if (inputLocked) return;
          if (!isDragDropOrderSubmittable(question, orderedIds)) return;
          void onSubmitRequest();
        }}
      >
        <p
          className="text-base font-bold text-foreground"
          id="activity-ddo-prompt"
        >
          Sắp xếp các ý theo đúng thứ tự (kéo thả):
        </p>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedIds}
            strategy={verticalListSortingStrategy}
          >
            <div
              className="grid gap-3"
              role="list"
              aria-labelledby="activity-ddo-prompt"
            >
              {orderedIds.map((id, index) => {
                const item = itemById.get(id);
                if (!item) return null;
                const rawLabel = concatTextFromSegments(item.content);
                const plain = coarsePlainTextFromMarkdown(rawLabel);
                const position = index + 1;
                const rowAriaLabel = `Vị trí ${position}. ${plain}. Kéo để thay đổi thứ tự.`;
                return (
                  <div key={id} role="listitem">
                    <SortableItem
                      id={id}
                      position={position}
                      disabled={inputLocked}
                      rowAriaLabel={rowAriaLabel}
                    >
                      <ContentBlockRenderer
                        blocks={item.content}
                        className="min-w-0 flex-1 text-base text-foreground"
                      />
                    </SortableItem>
                  </div>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
        <p className="text-xs text-muted-foreground">
          Ctrl+Enter hoặc Cmd+Enter trên nút Kiểm tra để nộp.
        </p>
      </div>
    </div>
  );
}
