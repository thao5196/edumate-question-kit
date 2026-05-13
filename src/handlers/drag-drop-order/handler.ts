import { isDragDropOrderSubmittable } from "../../questions/drag-drop-order-question";
import type {
  DragDropOrderQuestionPayload,
  NextQuestionResponse,
  SubmitAnswerResponseValue,
} from "../../types";
import { isDragDropOrderQuestion } from "../../types";
import type {
  ActivityAnswerDraft,
  QuestionRegistryEntry,
} from "../../registry/types";

export function parseDragDropOrderQuestion(
  q: NextQuestionResponse,
): DragDropOrderQuestionPayload | null {
  return isDragDropOrderQuestion(q) ? q : null;
}

export function canSubmitDragDropOrder(
  model: unknown,
  answer: ActivityAnswerDraft,
): boolean {
  const q = model as DragDropOrderQuestionPayload;
  return Array.isArray(answer) && isDragDropOrderSubmittable(q, answer);
}

export function toSubmitPayloadDragDropOrder(
  model: unknown,
  answer: ActivityAnswerDraft,
): SubmitAnswerResponseValue | null {
  const q = model as DragDropOrderQuestionPayload;
  if (!Array.isArray(answer) || !isDragDropOrderSubmittable(q, answer))
    return null;
  return { type: "drag_drop_order", orderedIds: answer };
}

export const dragDropOrderQuestionEntry: QuestionRegistryEntry = {
  parse: (q) => parseDragDropOrderQuestion(q),
  canSubmit: canSubmitDragDropOrder,
  toSubmitPayload: toSubmitPayloadDragDropOrder,
  invalidShapeTitle: "Không tải được câu sắp xếp thứ tự",
  invalidShapeDescription: "Vui lòng thử lại sau.",
};
