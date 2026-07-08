import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export function Card({
  className,
  raised = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { raised?: boolean }) {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-border p-5",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_1px_2px_0_rgba(0,0,0,0.3),0_16px_40px_-16px_rgba(0,0,0,0.65)]",
        "bg-gradient-to-b",
        raised
          ? "from-surface-raised to-surface-raised/90"
          : "from-surface to-surface/90",
        className,
      )}
      {...props}
    />
  );
}
