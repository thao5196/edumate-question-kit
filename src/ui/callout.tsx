import * as React from "react";
import { Lightbulb } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../utils/cn";

const calloutVariants = cva(
  "rounded-xl border p-6 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      hue: {
        gray: "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/40",
        red: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40",
        orange:
          "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/40",
        yellow:
          "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/40",
        green:
          "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/40",
        teal: "border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/40",
        blue: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40",
        cyan: "border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950/40",
        purple:
          "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/40",
        pink: "border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-950/40",
        indigo:
          "border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/40",
      },
    },
    defaultVariants: { hue: "orange" },
  },
);

type CalloutProps = React.ComponentProps<"div"> &
  VariantProps<typeof calloutVariants> & {
    label?: string;
    iconPlain?: boolean;
  };

export function Callout({
  className,
  hue,
  label,
  iconPlain,
  children,
  ...props
}: CalloutProps) {
  return (
    <div className={cn(calloutVariants({ hue }), className)} {...props}>
      <div className="flex gap-3">
        <div className="shrink-0 text-blue-600 dark:text-blue-400">
          <Lightbulb className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          {label && (
            <p className="mb-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
              {label}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
