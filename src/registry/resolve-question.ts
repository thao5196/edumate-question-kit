import type { NextQuestionResponse } from "../types";

import { QUESTION_REGISTRY } from "./registry";
import type { QuestionRegistryEntry } from "./types";
import type { SupportedActivityQuestionType } from "./supported-types";

export type ResolveQuestionResult =
  | { kind: "success"; model: unknown; entry: QuestionRegistryEntry }
  | { kind: "unsupported"; activityType: string }
  | {
      kind: "invalid_shape";
      activityType: string;
      title: string;
      description: string;
    };

function registryEntryForType(type: string): QuestionRegistryEntry | undefined {
  return Object.prototype.hasOwnProperty.call(QUESTION_REGISTRY, type)
    ? QUESTION_REGISTRY[type as SupportedActivityQuestionType]
    : undefined;
}

export function resolveQuestion(
  q: NextQuestionResponse | null,
): ResolveQuestionResult | null {
  if (!q) return null;

  const entry = registryEntryForType(q.type);
  if (!entry) {
    return { kind: "unsupported", activityType: q.type };
  }
  const model = entry.parse(q);
  if (model == null) {
    return {
      kind: "invalid_shape",
      activityType: q.type,
      title: entry.invalidShapeTitle,
      description: entry.invalidShapeDescription,
    };
  }

  return { kind: "success", model, entry };
}
