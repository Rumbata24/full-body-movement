"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IntensityBadge } from "@/components/ui/IntensityBadge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { todayISO } from "@/lib/date";
import { getCheckInByDate, getWeeklyPlan } from "@/lib/data";
import { FEELING_META, INTENSITY_META } from "@/lib/intensity";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/UserProvider";
import type { CheckIn, WeeklyPlanDay } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TodayPage() {
  const { user } = useUser();
  const [plan, setPlan] = useState<WeeklyPlanDay[] | null>(null);
  const [checkIn, setCheckIn] = useState<CheckIn | null | undefined>(
    undefined,
  );
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => setNow(new Date()));
  }, []);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    getWeeklyPlan(supabase).then(setPlan);
    getCheckInByDate(supabase, todayISO()).then(setCheckIn);
  }, [user]);

  const dayOfWeek = new Date().getDay();
  const plannedToday = plan?.find((p) => p.day_of_week === dayOfWeek)
    ?.default_intensity;

  const loading = checkIn === undefined || !plan;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm text-text-muted">
          {now
            ? now.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })
            : " "}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold">
          {now ? greeting(now) : "Welcome back"}
        </h1>
      </header>

      {loading ? (
        <Card className="h-64 animate-pulse" />
      ) : checkIn ? (
        <Card className="flex flex-col items-center gap-4 py-8">
          <ScoreRing progress={1} color={INTENSITY_META[checkIn.chosen_intensity].color}>
            <div className="flex flex-col items-center">
              <span className="text-3xl">
                {FEELING_META[checkIn.feeling].emoji}
              </span>
              <span className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold">
                {INTENSITY_META[checkIn.chosen_intensity].label}
              </span>
            </div>
          </ScoreRing>
          <p className="text-center text-sm text-text-muted">
            {INTENSITY_META[checkIn.chosen_intensity].blurb}
          </p>
          <div className="mt-2 flex w-full flex-col gap-2">
            <Link href="/log">
              <Button className="w-full">Log today&apos;s workout</Button>
            </Link>
            <Link href="/check-in">
              <Button variant="ghost" className="w-full">
                Redo check-in
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col items-center gap-4 py-10 text-center">
          <p className="text-[15px] text-text-muted">
            Take a moment to check in before training.
          </p>
          {plannedToday && (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              Planned today
              <IntensityBadge intensity={plannedToday} size="sm" />
            </div>
          )}
          <Link href="/check-in" className="w-full">
            <Button className="w-full">Start check-in</Button>
          </Link>
        </Card>
      )}

      <Link
        href="/weekly"
        className="block transition-transform active:scale-[0.98]"
      >
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-[15px] font-medium">This week</p>
            <p className="text-sm text-text-muted">Planned vs actual</p>
          </div>
          <span className="text-text-faint">&rarr;</span>
        </Card>
      </Link>
    </div>
  );
}

function greeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
