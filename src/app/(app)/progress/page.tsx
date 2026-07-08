"use client";

import { Card } from "@/components/ui/Card";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { ExercisePicker } from "@/components/ExercisePicker";
import { formatFriendly } from "@/lib/date";
import { ExerciseHistoryPoint, getExerciseHistory, getExercises } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/UserProvider";
import type { Exercise } from "@/lib/types";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

export default function ProgressPage() {
  const { user } = useUser();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [historyEntry, setHistoryEntry] = useState<{
    id: string;
    points: ExerciseHistoryPoint[];
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    getExercises(createClient()).then((ex) => {
      setExercises(ex);
      if (ex.length > 0) setSelectedId(ex[0].id);
    });
  }, [user]);

  useEffect(() => {
    if (!selectedId) return;
    getExerciseHistory(createClient(), selectedId).then((points) => {
      setHistoryEntry({ id: selectedId, points });
    });
  }, [selectedId]);

  const history =
    historyEntry?.id === selectedId ? historyEntry.points : null;

  const usesDuration = useMemo(() => {
    if (!history || history.length === 0) return true;
    const durationCount = history.filter((p) => p.best_duration_seconds !== null).length;
    const repsCount = history.filter((p) => p.best_reps !== null).length;
    return durationCount >= repsCount;
  }, [history]);

  const chartData = useMemo(
    () =>
      (history ?? []).map((p) => ({
        date: p.date,
        value: usesDuration ? p.best_duration_seconds : p.best_reps,
      })),
    [history, usesDuration],
  );

  const latest = chartData.at(-1)?.value ?? null;
  const previous = chartData.at(-2)?.value ?? null;
  const delta =
    latest !== null && previous !== null ? latest - previous : null;
  const best = useMemo(
    () =>
      chartData.reduce(
        (max, p) => (p.value !== null && p.value > max ? p.value : max),
        0,
      ),
    [chartData],
  );
  const ringProgress = best > 0 && latest !== null ? latest / best : 0;
  const selectedExercise = exercises.find((e) => e.id === selectedId);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Progress
        </h1>
      </header>

      <button
        onClick={() => setPickerOpen(true)}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-gradient-to-b from-surface-raised to-surface-raised/80 px-4 py-3 text-left text-[15px] font-medium text-text shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
      >
        {selectedExercise?.name ?? "Select exercise"}
        <ChevronDown size={18} className="text-text-faint" />
      </button>

      <Card className="flex flex-col items-center gap-4 py-10 text-center">
        {history === null ? (
          <div className="h-52 w-52 animate-pulse rounded-full bg-surface-raised" />
        ) : latest === null ? (
          <p className="py-16 text-sm text-text-muted">
            No logs yet for this exercise.
          </p>
        ) : (
          <>
            <ScoreRing progress={ringProgress} size={208} strokeWidth={10}>
              <div className="flex flex-col items-center">
                <span className="font-[family-name:var(--font-display)] text-5xl font-semibold tabular-nums tracking-tight">
                  {latest}
                </span>
                <span className="mt-0.5 text-sm text-text-muted">
                  {usesDuration ? "seconds" : "reps"}
                </span>
              </div>
            </ScoreRing>
            <span className="text-sm text-text-muted">
              {delta === null
                ? "Latest session"
                : delta === 0
                  ? "Same as last session"
                  : `${delta > 0 ? "+" : ""}${delta} vs last session`}
            </span>
          </>
        )}
      </Card>

      {history !== null && (
        <Card className={chartData.length > 1 ? "h-56 pr-0" : undefined}>
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 8" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => formatFriendly(d).split(",")[0]}
                  stroke="var(--color-text-faint)"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface-raised)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 13,
                  }}
                  labelFormatter={(d) => formatFriendly(d as string)}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-accent)"
                  strokeWidth={2.5}
                  fill="url(#progressFill)"
                  dot={{ r: 3, fill: "var(--color-accent)", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "var(--color-accent)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-6 text-center text-sm text-text-muted">
              Log a couple more sessions to see your trend.
            </p>
          )}
        </Card>
      )}

      {pickerOpen && (
        <ExercisePicker
          title="Select exercise"
          exercises={exercises}
          selectedId={selectedId}
          onSelect={(ex) => {
            setSelectedId(ex.id);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
