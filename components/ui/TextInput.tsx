import React from "react";
import { cn } from "@/lib/utils";

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-muted">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full h-12 px-4 py-3 bg-surface-soft text-ink text-sm rounded-md border border-hairline transition-all duration-150 outline-none",
            "placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20",
            error && "border-semantic-down focus:border-semantic-down focus:ring-semantic-down/20",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs font-medium text-semantic-down">{error}</span>}
        {helperText && !error && <span className="text-xs text-muted">{helperText}</span>}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
