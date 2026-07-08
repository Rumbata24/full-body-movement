import { INTENSITY_META, INTENSITY_ORDER } from "@/lib/intensity";
import type { IntensityLevel } from "@/lib/types";
import { clsx } from "clsx";

export function IntensitySelector({
  value,
  onChange,
}: {
  value: IntensityLevel;
  onChange: (level: IntensityLevel) => void;
}) {
  return (
    <div className="flex gap-2">
      {INTENSITY_ORDER.map((level) => {
        const active = value === level;
        const color = INTENSITY_META[level].color;
        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={clsx(
              "flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all",
              active
                ? "border-transparent text-bg"
                : "border-border bg-gradient-to-b from-surface to-surface/80 text-text-muted shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
            )}
            style={
              active
                ? { background: color, boxShadow: `0 6px 18px -6px ${color}` }
                : undefined
            }
          >
            {INTENSITY_META[level].label}
          </button>
        );
      })}
    </div>
  );
}
