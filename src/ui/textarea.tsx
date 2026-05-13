import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../utils/cn";

const textareaVariants = cva(
  "flex field-sizing-content min-h-16 w-full bg-transparent outline-none transition-[color,border-color,box-shadow] placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30 dark:disabled:bg-input/80",
  {
    variants: {
      variant: {
        default:
          "rounded-lg border border-input px-2.5 py-2 text-base focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        bordered:
          "rounded-md border border-input px-3.5 py-2.5 text-base focus-visible:border-blue-500 focus-visible:shadow-[inset_0_0_0_1px_var(--color-blue-500)] aria-invalid:border-destructive aria-invalid:shadow-[inset_0_0_0_1px_var(--color-destructive)] aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:shadow-[inset_0_0_0_1px_var(--color-destructive)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type TextareaProps = React.ComponentProps<"textarea"> &
  VariantProps<typeof textareaVariants>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, variant, ...props }, ref) {
    return (
      <textarea
        data-slot="textarea"
        className={cn(textareaVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);

export { Textarea, textareaVariants };
export type { TextareaProps };
