import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "pill-cta"
    | "secondary-light"
    | "secondary-dark"
    | "outline-on-dark"
    | "tertiary-text";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-sans font-semibold transition-all duration-150 rounded-pill select-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed";

    const variantStyles = {
      primary:
        "bg-primary text-on-primary hover:bg-primary-active active:bg-primary-active disabled:bg-primary-disabled disabled:text-on-primary/70",
      "pill-cta":
        "bg-primary text-on-primary hover:bg-primary-active active:bg-primary-active text-lg px-8 py-4 h-14 disabled:bg-primary-disabled shadow-sm",
      "secondary-light":
        "bg-surface-strong text-ink hover:bg-hairline active:bg-hairline-soft border border-hairline/40",
      "secondary-dark":
        "bg-surface-dark-elevated text-on-dark hover:bg-surface-dark-elevated/80 border border-white/10",
      "outline-on-dark":
        "bg-transparent text-on-dark border border-white/30 hover:border-white active:bg-white/10",
      "tertiary-text":
        "bg-transparent text-primary hover:text-primary-active underline-offset-4 hover:underline p-0 h-auto font-medium",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 h-8",
      md: "text-sm px-5 py-2.5 h-11",
      lg: "text-base px-6 py-3 h-12",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          variantStyles[variant],
          variant !== "pill-cta" && variant !== "tertiary-text" && sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
