import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "secondary";
};

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantClassName =
    variant === "secondary"
      ? "border-transparent bg-secondary text-secondary-foreground"
      : "border-transparent bg-primary text-primary-foreground";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantClassName,
        className
      )}
      {...props}
    />
  );
}

export { Badge };


