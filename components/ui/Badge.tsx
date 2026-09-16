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
    pill: "bg-surface-card text-ink border border-hairline",
    "pill-dark": "bg-surface-dark text-on-dark border border-white/20",
    "semantic-up": "bg-semantic-up/15 text-semantic-up border border-semantic-up/30",
    "semantic-down": "bg-semantic-down/15 text-semantic-down border border-semantic-down/30",
    primary: "bg-primary/15 text-primary border border-primary/30",
    gold: "bg-accent-gold/20 text-accent-gold border border-accent-gold/40",
  };

  return (
    <span className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      {children}
    </span>
  );
};
