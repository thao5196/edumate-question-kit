import {
  LearningActivityMarkdown,
  prepareActivityStemMarkdown,
} from "../markdown/question-markdown-shared";
import type { ActivityQuestionSegment } from "../types";

export interface TextBlock {
  id: string;
  type: "text";
  text: string;
}

export interface ImageBlock {
  id: string;
  type: "image";
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  blurhash?: string;
}

export type ContentBlock = TextBlock | ImageBlock | ActivityQuestionSegment;

type Props = {
  blocks: ContentBlock[];
  className?: string;
};

export function ContentBlockRenderer({ blocks, className }: Props) {
  return (
    <div className={className}>
      {blocks.map((block) => {
        if (block.type === "text") {
          const text = (block as TextBlock).text;
          return (
            <LearningActivityMarkdown key={block.id}>
              {prepareActivityStemMarkdown(text)}
            </LearningActivityMarkdown>
          );
        }

        if (block.type === "image") {
          const imgBlock = block as ImageBlock;
          const hasSize = imgBlock.width != null && imgBlock.height != null;
          const figureClass = hasSize
            ? "my-2 w-full"
            : "my-2 w-full max-w-sm mx-auto";
          return (
            <figure key={block.id} className={figureClass}>
              <img
                src={imgBlock.url}
                alt={imgBlock.alt ?? ""}
                width={imgBlock.width}
                height={imgBlock.height}
                className="w-full h-auto object-contain rounded-lg"
              />
            </figure>
          );
        }

        return null;
      })}
    </div>
  );
}
