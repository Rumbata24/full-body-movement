"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IntensitySelector } from "@/components/ui/IntensitySelector";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { todayISO } from "@/lib/date";
import { getWeeklyPlan, upsertCheckIn } from "@/lib/data";
import {
  FEELING_META,
  FEELING_ORDER,
  INTENSITY_META,
  suggestIntensity,
} from "@/lib/intensity";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/UserProvider";
import type { FeelingLevel, IntensityLevel, WeeklyPlanDay } from "@/lib/types";
import { clsx } from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckInPage() {
  const { user } = useUser();
  const router = useRouter();
  const [plan, setPlan] = useState<WeeklyPlanDay[] | null>(null);
  const [feeling, setFeeling] = useState<FeelingLevel | null>(null);
  const [chosen, setChosen] = useState<IntensityLevel | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    getWeeklyPlan(createClient()).then(setPlan);
  }, [user]);

  const dayOfWeek = new Date().getDay();
  const planned = plan?.find((p) => p.day_of_week === dayOfWeek)
    ?.default_intensity;

  const suggested =
    planned && feeling ? suggestIntensity(planned, feeling) : null;

  function selectFeeling(f: FeelingLevel) {
    setFeeling(f);
    if (planned) setChosen(suggestIntensity(planned, f));
  }

  async function confirm() {
    if (!user || !feeling || !planned || !chosen || !suggested) return;
    setSaving(true);
    const supabase = createClient();
    await upsertCheckIn(supabase, user.id, {
      date: todayISO(),
      feeling,
      planned_intensity: planned,
      suggested_intensity: suggested,
      chosen_intensity: chosen,
    });
    router.push("/");
  }

  if (!plan) {
    return <Card className="h-64 animate-pulse" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Check in
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          How do you feel today?
        </p>
      </header>

      <div className="grid grid-cols-5 gap-2">
        {FEELING_ORDER.map((f) => (
          <button
            key={f}
            onClick={() => selectFeeling(f)}
            className={clsx(
              "flex flex-col items-center gap-1.5 rounded-2xl border py-4 text-xs font-medium transition-all",
              "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]",
              feeling === f
                ? "border-accent/60 bg-accent-soft text-text shadow-[0_0_20px_-4px_var(--color-accent)]"
                : "border-border bg-gradient-to-b from-surface to-surface/80 text-text-muted",
            )}
          >
            <span className="text-2xl">{FEELING_META[f].emoji}</span>
            {FEELING_META[f].label}
          </button>
        ))}
      </div>

      {feeling && chosen && (
        <Card className="flex flex-col items-center gap-4 py-8 text-center">
          <p className="text-sm text-text-muted">
            {suggested === planned
              ? "Sticking with today's plan"
              : "We suggest a lighter day"}
          </p>

          <ScoreRing
            progress={1}
            size={148}
            strokeWidth={9}
            color={INTENSITY_META[chosen].color}
          >
            <span
              className="font-[family-name:var(--font-display)] text-xl font-semibold"
              style={{ color: INTENSITY_META[chosen].color }}
            >
              {INTENSITY_META[chosen].label}
            </span>
          </ScoreRing>

          <p className="text-sm text-text-muted">
            {INTENSITY_META[chosen].blurb}
          </p>

          <div className="mt-2 w-full">
            <IntensitySelector value={chosen} onChange={setChosen} />
          </div>

          <Button className="mt-2 w-full" onClick={confirm} disabled={saving}>
            {saving ? "Saving…" : "Confirm & continue"}
          </Button>
        </Card>
      )}
    </div>
  );
}
