"use client";

import { clsx } from "clsx";
import { Trash2 } from "lucide-react";

export interface DraftSetInput {
  tempId: string;
  mode: "reps" | "duration";
  reps: string;
  duration_seconds: string;
  rpe: string;
  notes: string;
}

export function SetRow({
  set,
  index,
  onChange,
  onRemove,
}: {
  set: DraftSetInput;
  index: number;
  onChange: (patch: Partial<DraftSetInput>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-bg-soft/60 px-2.5 py-2">
      <span className="w-4 shrink-0 text-xs text-text-faint">{index + 1}</span>

      <div className="flex shrink-0 overflow-hidden rounded-lg border border-border">
        {(["reps", "duration"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange({ mode: m })}
            className={clsx(
              "px-2.5 py-2 text-xs font-medium transition-colors",
              set.mode === m
                ? "bg-accent-soft text-accent"
                : "bg-surface-raised text-text-faint",
            )}
          >
            {m === "reps" ? "Reps" : "Sec"}
          </button>
        ))}
      </div>

      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={set.mode === "reps" ? set.reps : set.duration_seconds}
        onChange={(e) =>
          onChange(
            set.mode === "reps"
              ? { reps: e.target.value }
              : { duration_seconds: e.target.value },
          )
        }
        placeholder="0"
        className="w-16 rounded-lg border border-border bg-surface-raised px-2 py-2 text-center text-[15px] font-medium tabular-nums text-text focus:border-accent focus:outline-none"
      />

      <select
        value={set.rpe}
        onChange={(e) => onChange({ rpe: e.target.value })}
        className="w-16 rounded-lg border border-border bg-surface-raised px-1 py-2 text-center text-sm text-text-muted focus:border-accent focus:outline-none"
      >
        <option value="">RPE</option>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onRemove}
        className="ml-auto shrink-0 p-1.5 text-text-faint transition-colors active:text-high"
        aria-label="Remove set"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
