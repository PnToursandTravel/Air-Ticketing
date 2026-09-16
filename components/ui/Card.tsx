import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark" | "soft" | "bordered";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "light", children, ...props }, ref) => {
    const variantStyles = {
      light: "bg-surface-card text-ink border border-hairline shadow-soft-drop",
      dark: "bg-surface-dark text-on-dark border border-white/10 shadow-soft-drop",
      soft: "bg-surface-soft text-ink border border-hairline",
      bordered: "bg-surface-card text-ink border border-hairline",
    };

    return (
      <div
        ref={ref}
        className={cn("rounded-xl p-6 sm:p-8 transition-all duration-200", variantStyles[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
