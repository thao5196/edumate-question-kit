"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { Label } from "./label";
import { cn } from "../utils/cn";

const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    data-slot="radio-group"
    className={cn("grid gap-2", className)}
    {...props}
  />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    data-slot="radio-group-item"
    className={cn(
      "aspect-square size-4 shrink-0 rounded-full border border-input bg-background text-primary shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary dark:bg-input/30 dark:disabled:bg-input/80",
      className,
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <span className="size-2 rounded-full bg-primary" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

type RadioGroupCardItemProps = Omit<
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
  "children"
> & {
  letter: string;
  children: React.ReactNode;
  id: string;
};

const RadioGroupCardItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupCardItemProps
>(({ className, letter, children, id, ...props }, ref) => (
  <div className="w-full min-w-0">
    <RadioGroupPrimitive.Item
      ref={ref}
      id={id}
      data-slot="radio-group-card-item"
      className={cn("peer sr-only outline-none focus-visible:outline-none")}
      {...props}
    />
    <Label
      htmlFor={id}
      className={cn(
        "peer-data-[state=checked]:[&_.mc-radio-card-badge]:bg-blue-500 peer-data-[state=checked]:[&_.mc-radio-card-badge]:text-white",
        "flex w-full min-w-0 cursor-pointer items-center gap-4 rounded-xl border-2 border-border bg-background px-4 py-4 font-normal",
        "transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out",
        "motion-reduce:transition-none motion-safe:active:scale-[0.99]",
        "hover:bg-gray-50/80 dark:hover:bg-blue-950/30",
        "peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50/50 dark:peer-data-[state=checked]:bg-blue-950/25",
        "peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
        "peer-disabled:pointer-events-none peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
        className,
      )}
    >
      <span
        className={cn(
          "mc-radio-card-badge flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold uppercase",
          "bg-gray-200/80 text-foreground transition-[color,background-color] duration-200 ease-out motion-reduce:transition-none",
          "dark:bg-muted/80",
        )}
        aria-hidden
      >
        {letter}
      </span>
      <div className="min-w-0 flex-1 text-base leading-relaxed text-foreground">
        {children}
      </div>
    </Label>
  </div>
));
RadioGroupCardItem.displayName = "RadioGroupCardItem";

export { RadioGroup, RadioGroupItem, RadioGroupCardItem };
