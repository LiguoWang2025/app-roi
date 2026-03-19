"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
}

function RadioGroup({
  className,
  value,
  onValueChange,
  orientation = "vertical",
  ...props
}: RadioGroupProps) {
  return (
    <div
      className={cn(
        orientation === "horizontal" ? "flex" : "grid gap-2",
        className,
      )}
      {...props}
    />
  );
}

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  value: string;
}

function RadioGroupItem({
  className,
  id,
  value,
  ...props
}: RadioGroupItemProps) {
  return (
    <input
      type="radio"
      id={id}
      value={value}
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-full border border-input text-primary outline-none transition-all focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { RadioGroup, RadioGroupItem };
