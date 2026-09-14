import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "pill" | "pill-dark" | "semantic-up" | "semantic-down" | "primary";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "pill",
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-pill transition-colors";

  const variantStyles = {
    pill: "bg-surface-strong text-ink border border-hairline/50",
    "pill-dark": "bg-surface-dark-elevated text-on-dark border border-white/10",
    "semantic-up": "bg-semantic-up/10 text-semantic-up border border-semantic-up/20",
    "semantic-down": "bg-semantic-down/10 text-semantic-down border border-semantic-down/20",
    primary: "bg-primary/10 text-primary border border-primary/20",
  };

  return (
    <span className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      {children}
    </span>
  );
};
