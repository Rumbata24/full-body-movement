import { INTENSITY_META } from "@/lib/intensity";
import type { IntensityLevel } from "@/lib/types";
import { clsx } from "clsx";

export function IntensityBadge({
  intensity,
  size = "md",
  variant = "filled",
  className,
}: {
  intensity: IntensityLevel;
  size?: "sm" | "md";
  variant?: "filled" | "outline";
  className?: string;
}) {
  const meta = INTENSITY_META[intensity];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
        variant === "outline" && "border bg-transparent",
        className,
      )}
      style={
        variant === "outline"
          ? {
              borderColor: `color-mix(in srgb, ${meta.color} 55%, transparent)`,
              color: meta.color,
            }
          : { background: meta.colorSoft, color: meta.color }
      }
    >
      <span
        className={clsx(
          "h-1.5 w-1.5 rounded-full",
          variant === "outline" && "opacity-70",
        )}
        style={{ background: meta.color }}
      />
      {meta.label}
    </span>
  );
}
