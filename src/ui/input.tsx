import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../utils/cn";

const inputVariants = cva(
  "w-full min-w-0 bg-transparent outline-none transition-[color,border-color,box-shadow] file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30 dark:disabled:bg-input/80",
  {
    variants: {
      variant: {
        default:
          "h-8 rounded-lg border border-input px-2.5 py-1 text-base focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        bordered:
          "rounded-md border border-input px-3.5 py-2.5 text-base focus-visible:border-blue-500 focus-visible:shadow-[inset_0_0_0_1px_var(--color-blue-500)] aria-invalid:border-destructive aria-invalid:shadow-[inset_0_0_0_1px_var(--color-destructive)] aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:shadow-[inset_0_0_0_1px_var(--color-destructive)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type InputProps = React.ComponentProps<"input"> &
  VariantProps<typeof inputVariants>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type, variant, ...props },
  ref,
) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input, inputVariants };
export type { InputProps };
