import { BlurhashImage } from "../components/blurhash-image/blurhash-image";
import {
  LearningActivityMarkdown,
  prepareActivityStemMarkdown,
} from "../markdown/question-markdown-shared";

export interface TextBlock {
  id: string;
  type: "text";
  text: string;
}

export interface ImageBlock {
  id: string;
  type: "image";
  blurhash: string;
  url: string;
  alt?: string;
  caption?: string;
  /** Kích thước gốc của ảnh — dùng để tính ratio chính xác */
  width?: number;
  height?: number;
}
export type ContentBlock = TextBlock | ImageBlock;

type Props = {
  blocks: ContentBlock[];
  className?: string;
};

export function ContentBlockRenderer({ blocks, className }: Props) {
  return (
    <div className={className}>
      {blocks.map((block) => {
        if (block.type === "text") {
          return (
            <LearningActivityMarkdown key={block.id}>
              {prepareActivityStemMarkdown(block.text)}
            </LearningActivityMarkdown>
          );
        }

        if (block.type === "image") {
          const hasSize = block.width != null && block.height != null;
          const ratio = hasSize ? block.width! / block.height! : 16 / 9;
          // Khi không có kích thước thực, giới hạn chiều rộng để ảnh không chiếm quá nhiều không gian
          const figureClass = hasSize
            ? "my-2 w-full"
            : "my-2 w-full max-w-sm mx-auto";
          return (
            <figure key={block.id} className={figureClass}>
              <BlurhashImage
                blurhash={block.blurhash}
                alt={block.alt ?? ""}
                ratio={ratio}
                objectFit="contain"
                className="w-full overflow-hidden rounded-lg"
              />
              {/* {block.caption && (
                <figcaption className="mt-1.5 text-center text-sm text-muted-foreground">
                  {block.caption}
                </figcaption>
              )} */}
            </figure>
          );
        }

        return null;
      })}
    </div>
  );
}
