import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost";
};

function Button({
  className,
  variant = "default",
  type = "button",
  ...props
}: ButtonProps) {
  const variantClassName =
    variant === "secondary"
      ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      : variant === "ghost"
        ? "bg-transparent text-foreground hover:bg-accent"
        : "bg-primary text-primary-foreground hover:bg-primary/90";

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none",
        variantClassName,
        className
      )}
      {...props}
    />
  );
}

export { Button };


