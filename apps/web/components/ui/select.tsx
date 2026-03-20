"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextType | undefined>(
  undefined,
);

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  className?: string;
  defaultValue?: string;
}

function Select({
  value,
  onValueChange,
  children,
  className,
  defaultValue,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState<string | undefined>(
    defaultValue,
  );

  const controlledValue = value !== undefined ? value : selectedValue;
  const controlledOnChange = onValueChange || setSelectedValue;

  return (
    <SelectContext.Provider
      value={{
        value: controlledValue,
        onValueChange: controlledOnChange,
        open,
        onOpenChange: setOpen,
      }}
    >
      <div className={cn("relative", className)}>{children}</div>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

function SelectTrigger({ children, className, ...props }: SelectTriggerProps) {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("SelectTrigger must be used within Select");
  }

  const { open, onOpenChange } = context;

  return (
    <button
      type="button"
      role="combobox"
      aria-expanded={open}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      onClick={() => onOpenChange(!open)}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}
SelectTrigger.displayName = "SelectTrigger";

interface SelectValueProps {
  placeholder?: string;
  children?: React.ReactNode;
}

function SelectValue({ placeholder, children }: SelectValueProps) {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("SelectValue must be used within Select");
  }

  const { value } = context;

  return <span className="">{value || children || placeholder}</span>;
}

interface SelectContentProps {
  children?: React.ReactNode;
  className?: string;
}

function SelectContent({ children, className }: SelectContentProps) {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("SelectContent must be used within Select");
  }

  const { open, onOpenChange } = context;
  const contentRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open && contentRef.current) {
      const trigger = contentRef.current.previousElementSibling as HTMLElement;
      triggerRef.current = trigger;

      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();

        let top = rect.bottom + 4;
        if (top + contentRect.height > window.innerHeight) {
          top = rect.top - contentRect.height - 4;
        }

        contentRef.current.style.position = "fixed";
        contentRef.current.style.left = `${rect.left + window.scrollX}px`;
        contentRef.current.style.top = `${top + window.scrollY}px`;
        contentRef.current.style.width = `${rect.width}px`;
      }
    }
  }, [open, mounted]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onOpenChange]);

  if (!open || !mounted) {
    return null;
  }

  return (
    <div
      ref={contentRef}
      className={cn(
        "z-[9999] rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md",
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
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("SelectItem must be used within Select");
  }

  const { value: selectedValue, onValueChange, onOpenChange } = context;
  const isSelected = selectedValue === value;

  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected && "bg-accent text-accent-foreground",
        className,
      )}
      onClick={() => {
        onValueChange?.(value);
        onOpenChange(false);
      }}
    >
      {children}
    </div>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
