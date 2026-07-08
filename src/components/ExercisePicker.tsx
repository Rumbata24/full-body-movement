"use client";

import { Button } from "@/components/ui/Button";
import type { Exercise, ExerciseCategory } from "@/lib/types";
import { Check, X } from "lucide-react";
import { clsx } from "clsx";
import { useMemo, useState } from "react";

const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  skill: "Skills",
  strength: "Strength",
  mobility: "Mobility",
  stretch: "Stretch",
};

export function ExercisePicker({
  title = "Add exercise",
  exercises,
  selectedId,
  onSelect,
  onCreateCustom,
  onClose,
}: {
  title?: string;
  exercises: Exercise[];
  selectedId?: string;
  onSelect: (exercise: Exercise) => void;
  onCreateCustom?: (name: string, category: ExerciseCategory) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      exercises.filter((e) =>
        e.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [exercises, query],
  );

  const grouped = useMemo(() => {
    const groups = new Map<ExerciseCategory, Exercise[]>();
    for (const e of filtered) {
      if (!groups.has(e.category)) groups.set(e.category, []);
      groups.get(e.category)!.push(e);
    }
    return groups;
  }, [filtered]);

  const exactMatch = filtered.some(
    (e) => e.name.toLowerCase() === query.trim().toLowerCase(),
  );

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex max-h-[85dvh] w-full max-w-md flex-col rounded-t-3xl border-t border-border bg-bg-soft p-5 shadow-[0_-16px_50px_-12px_rgba(0,0,0,0.7)]">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
            {title}
          </h2>
          <button onClick={onClose} className="text-text-muted">
            <X size={22} />
          </button>
        </div>

        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises…"
          className="mb-3 w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-[15px] text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
        />

        <div className="flex-1 overflow-y-auto">
          {onCreateCustom && query.trim() && !exactMatch && (
            <div className="mb-3 rounded-xl border border-dashed border-border p-3">
              <p className="mb-2.5 text-[15px] text-accent">
                Add &quot;{query.trim()}&quot; as a custom exercise
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  Object.keys(CATEGORY_LABELS) as ExerciseCategory[]
                ).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => onCreateCustom(query.trim(), cat)}
                    className="rounded-full border border-border bg-surface-raised px-3 py-1.5 text-xs font-medium text-text-muted transition-colors active:border-accent/60 active:bg-accent-soft active:text-accent"
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {Array.from(grouped.entries()).map(([category, items]) => (
            <div key={category} className="mb-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-faint">
                {CATEGORY_LABELS[category]}
              </p>
              <div className="flex flex-col gap-1">
                {items.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => onSelect(ex)}
                    className={clsx(
                      "flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-[15px] transition-colors active:bg-surface-raised",
                      ex.id === selectedId ? "text-accent" : "text-text",
                    )}
                  >
                    <span>
                      {ex.name}
                      {ex.is_custom && (
                        <span className="ml-2 text-xs text-text-faint">
                          custom
                        </span>
                      )}
                    </span>
                    {ex.id === selectedId && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Button variant="secondary" onClick={onClose} className="mt-2 w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
}
