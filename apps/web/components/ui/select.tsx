"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  className?: string;
}

function Select({ value, onValueChange, children, className }: SelectProps) {
  const selectChildren = React.Children.toArray(children);
  const triggerChild = selectChildren.find(
    (child) =>
      React.isValidElement(child) &&
      (child.type as any).displayName === "SelectTrigger",
  );
  const contentChild = selectChildren.find(
    (child) =>
      React.isValidElement(child) &&
      (child.type as any).displayName === "SelectContent",
  );

  return (
    <div className={cn("relative", className)}>
      {triggerChild}
      {contentChild}
    </div>
  );
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

function SelectTrigger({ children, className, ...props }: SelectTriggerProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground shadow-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
SelectTrigger.displayName = "SelectTrigger";

interface SelectValueProps {
  placeholder?: string;
  children?: React.ReactNode;
}

function SelectValue({ placeholder, children }: SelectValueProps) {
  return <span>{children || placeholder}</span>;
}

interface SelectContentProps {
  children?: React.ReactNode;
  className?: string;
}

function SelectContent({ children, className }: SelectContentProps) {
  return (
    <div
      className={cn(
        "absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
SelectContent.displayName = "SelectContent";

interface SelectItemProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
}

function SelectItem({ value, children, className }: SelectItemProps) {
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
