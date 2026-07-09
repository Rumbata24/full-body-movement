"use client";

import { TrainingGuideContent } from "@/components/TrainingGuideContent";
import { Card } from "@/components/ui/Card";
import { IntensityBadge } from "@/components/ui/IntensityBadge";
import { currentWeekDates, toISODate } from "@/lib/date";
import { getCheckInsInRange, getWeeklyPlan, setPlanDay } from "@/lib/data";
import { INTENSITY_META, INTENSITY_ORDER } from "@/lib/intensity";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/UserProvider";
import type { CheckIn, IntensityLevel, WeeklyPlanDay } from "@/lib/types";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeeklyPage() {
  const { user } = useUser();
  const [plan, setPlan] = useState<WeeklyPlanDay[] | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [showInlineGuide, setShowInlineGuide] = useState(false);

  const week = useMemo(() => currentWeekDates(), []);
  const todayISOStr = toISODate(new Date());

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    getWeeklyPlan(supabase).then(setPlan);
    getCheckInsInRange(
      supabase,
      toISODate(week[0]),
      toISODate(week[6]),
    ).then(setCheckIns);
  }, [user, week]);

  async function cyclePlan(dayOfWeek: number, current: IntensityLevel) {
    if (!user || !plan) return;
    const idx = INTENSITY_ORDER.indexOf(current);
    const next = INTENSITY_ORDER[(idx + 1) % INTENSITY_ORDER.length];
    setPlan(
      plan.map((p) =>
        p.day_of_week === dayOfWeek ? { ...p, default_intensity: next } : p,
      ),
    );
    await setPlanDay(createClient(), user.id, dayOfWeek, next);
  }

  const streak = useMemo(() => {
    const dates = new Set(checkIns.map((c) => c.date));
    let count = 0;
    const cursor = new Date();
    while (dates.has(toISODate(cursor))) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [checkIns]);

  if (!plan) return <Card className="h-64 animate-pulse" />;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          This week
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {streak > 0
            ? `${streak} day check-in streak`
            : "Check in today to start a streak"}
        </p>
      </header>

      <button
        onClick={() => setShowInlineGuide((v) => !v)}
        className="flex items-center justify-between rounded-2xl border border-border bg-surface-raised/60 px-4 py-3 text-left transition-colors active:scale-[0.99]"
      >
        <span className="text-sm font-medium text-text-muted">
          How to structure your week
        </span>
        <ChevronDown
          size={16}
          className={clsx(
            "text-text-faint transition-transform",
            showInlineGuide && "rotate-180",
          )}
        />
      </button>
      {showInlineGuide && <TrainingGuideContent />}

      <Card className="flex flex-col gap-1">
        <div className="grid grid-cols-[2.25rem_1fr_1fr] items-center gap-2 px-2 pb-2 text-[11px] font-medium uppercase tracking-wide text-text-faint">
          <span />
          <span>Planned</span>
          <span>Actual</span>
        </div>
        {week.map((date, i) => {
          const dateISO = toISODate(date);
          const dayOfWeek = date.getDay();
          const planned = plan.find((p) => p.day_of_week === dayOfWeek)
            ?.default_intensity;
          const checkIn = checkIns.find((c) => c.date === dateISO);
          const isToday = dateISO === todayISOStr;
          const isFuture = dateISO > todayISOStr;

          return (
            <div
              key={i}
              className={clsx(
                "grid grid-cols-[2.25rem_1fr_1fr] items-center gap-2 rounded-xl px-2 py-2.5",
                isToday && "bg-accent-soft",
              )}
            >
              <span
                className={clsx(
                  "text-sm font-medium",
                  isToday ? "text-text" : "text-text-muted",
                )}
              >
                {DAY_NAMES[dayOfWeek]}
              </span>

              <div>
                {planned && (
                  <button onClick={() => cyclePlan(dayOfWeek, planned)}>
                    <IntensityBadge
                      intensity={planned}
                      size="sm"
                      variant="outline"
                    />
                  </button>
                )}
              </div>

              <div>
                {checkIn ? (
                  <IntensityBadge
                    intensity={checkIn.chosen_intensity}
                    size="sm"
                  />
                ) : isFuture ? (
                  <span className="text-xs text-text-faint">—</span>
                ) : (
                  <span className="text-xs text-text-faint">no check-in</span>
                )}
              </div>
            </div>
          );
        })}
      </Card>

      <p className="text-center text-xs text-text-faint">
        Tap a planned badge to cycle {INTENSITY_ORDER.map((l) => INTENSITY_META[l].label).join(" → ")}
      </p>
    </div>
  );
}
