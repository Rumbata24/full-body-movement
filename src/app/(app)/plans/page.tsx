"use client";

import { PlanGuideContent } from "@/components/PlanGuideContent";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getWorkoutPlans } from "@/lib/data";
import { EXAMPLE_PLANS } from "@/lib/examplePlans";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/UserProvider";
import type { WorkoutPlanWithSets } from "@/lib/types";
import { clsx } from "clsx";
import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PlansPage() {
  const { user } = useUser();
  const [plans, setPlans] = useState<WorkoutPlanWithSets[] | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!user) return;
    getWorkoutPlans(createClient()).then(setPlans);
  }, [user]);

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          My Plans
        </h1>
      </header>

      <button
        onClick={() => setShowGuide((v) => !v)}
        className="flex items-center justify-between rounded-2xl border border-border bg-surface-raised/60 px-4 py-3 text-left transition-colors active:scale-[0.99]"
      >
        <span className="text-sm font-medium text-text-muted">
          How to build a plan
        </span>
        <ChevronDown
          size={16}
          className={clsx(
            "text-text-faint transition-transform",
            showGuide && "rotate-180",
          )}
        />
      </button>
      {showGuide && <PlanGuideContent />}

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-text-faint">
          Example plans
        </p>
        <div className="flex flex-col gap-3">
          {EXAMPLE_PLANS.map((template) => (
            <Link
              key={template.key}
              href={`/plans/new?template=${template.key}`}
              className="block transition-transform active:scale-[0.98]"
            >
              <Card raised className="flex flex-col gap-1">
                <p className="text-[15px] font-medium">{template.name}</p>
                <p className="text-sm text-text-muted">{template.blurb}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Link href="/plans/new">
        <Button className="flex w-full items-center justify-center gap-1.5">
          <Plus size={18} /> New plan
        </Button>
      </Link>

      {!plans ? (
        <Card className="h-32 animate-pulse" />
      ) : plans.length === 0 ? (
        <p className="py-10 text-center text-sm text-text-muted">
          No plans saved yet. Build one before your next session.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {plans.map((plan) => {
            const names = Array.from(
              new Set(plan.plan_sets.map((s) => s.exercise.name)),
            );
            return (
              <Link
                key={plan.id}
                href={`/plans/${plan.id}`}
                className="block transition-transform active:scale-[0.98]"
              >
                <Card className="flex flex-col gap-1">
                  <p className="text-[15px] font-medium">{plan.name}</p>
                  <p className="line-clamp-1 text-sm text-text-muted">
                    {names.join(", ") || "No exercises"}
                  </p>
                  <p className="text-xs text-text-faint">
                    {plan.plan_sets.length} sets
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
