"use client";

import { Button } from "@/components/ui/Button";
import type { WorkoutPlanWithSets } from "@/lib/types";
import { X } from "lucide-react";

export function PlanPicker({
  plans,
  onSelect,
  onClose,
}: {
  plans: WorkoutPlanWithSets[];
  onSelect: (plan: WorkoutPlanWithSets) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex max-h-[85dvh] w-full max-w-md flex-col rounded-t-3xl border-t border-border bg-bg-soft p-5 shadow-[0_-16px_50px_-12px_rgba(0,0,0,0.7)]">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
            Start from a plan
          </h2>
          <button onClick={onClose} className="text-text-muted">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {plans.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">
              You haven&apos;t saved any plans yet.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {plans.map((plan) => {
                const names = Array.from(
                  new Set(plan.plan_sets.map((s) => s.exercise.name)),
                );
                return (
                  <button
                    key={plan.id}
                    onClick={() => onSelect(plan)}
                    className="rounded-xl px-3 py-2.5 text-left transition-colors active:bg-surface-raised"
                  >
                    <p className="text-[15px] text-text">{plan.name}</p>
                    <p className="line-clamp-1 text-xs text-text-faint">
                      {names.join(", ") || "No exercises"}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Button variant="secondary" onClick={onClose} className="mt-2 w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
}
