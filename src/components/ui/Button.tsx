import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-[15px] font-medium transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none",
        variant === "primary" &&
          "bg-accent text-bg shadow-[0_8px_24px_-8px_var(--color-accent)] hover:brightness-110",
        variant === "secondary" &&
          "border border-border bg-gradient-to-b from-surface-raised to-surface-raised/80 text-text shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] hover:border-text-faint",
        variant === "ghost" && "text-text-muted hover:text-text",
        className,
      )}
      {...props}
    />
  );
}
