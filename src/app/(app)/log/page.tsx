"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IntensitySelector } from "@/components/ui/IntensitySelector";
import { ExerciseBlock } from "@/components/log/ExerciseBlock";
import { ExercisePicker } from "@/components/ExercisePicker";
import { PlanPicker } from "@/components/plan/PlanPicker";
import { todayISO } from "@/lib/date";
import {
  createCustomExercise,
  createSession,
  getCheckInByDate,
  getExercises,
  getRecentSessions,
  getWeeklyPlan,
  getWorkoutPlans,
} from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/UserProvider";
import { setsToBlocks, useDraftBlocks } from "@/lib/useDraftBlocks";
import type {
  CheckIn,
  Exercise,
  ExerciseCategory,
  IntensityLevel,
  WorkoutPlanWithSets,
} from "@/lib/types";
import { ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LogPage() {
  const { user } = useUser();
  const router = useRouter();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [plans, setPlans] = useState<WorkoutPlanWithSets[]>([]);
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [intensity, setIntensity] = useState<IntensityLevel>("moderate");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [planPickerOpen, setPlanPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const draft = useDraftBlocks();

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    Promise.all([
      getExercises(supabase),
      getCheckInByDate(supabase, todayISO()),
      getWeeklyPlan(supabase),
      getWorkoutPlans(supabase),
    ]).then(([ex, ci, wp, plans]) => {
      setExercises(ex);
      setCheckIn(ci);
      setPlans(plans);
      const dayOfWeek = new Date().getDay();
      const planned = wp.find((p) => p.day_of_week === dayOfWeek)
        ?.default_intensity;
      setIntensity(ci?.chosen_intensity ?? planned ?? "moderate");
      setLoaded(true);
    });
  }, [user]);

  async function addCustomExercise(name: string, category: ExerciseCategory) {
    if (!user) return;
    const supabase = createClient();
    const exercise = await createCustomExercise(supabase, user.id, {
      name,
      category,
    });
    setExercises((prev) => [...prev, exercise]);
    draft.addExercise(exercise);
    setPickerOpen(false);
  }

  async function duplicateLastSession() {
    const supabase = createClient();
    const [last] = await getRecentSessions(supabase, 1);
    if (!last) return;
    draft.setBlocks(setsToBlocks(last.set_logs));
  }

  function startFromPlan(plan: WorkoutPlanWithSets) {
    draft.setBlocks(setsToBlocks(plan.plan_sets));
    setPlanPickerOpen(false);
  }

  async function handleSave() {
    if (!user || draft.totalSets === 0) return;
    setSaving(true);

    const supabase = createClient();
    await createSession(supabase, {
      date: todayISO(),
      intensity,
      check_in_id: checkIn?.id ?? null,
      notes: null,
      sets: draft.flattenToSets(),
    });

    router.push("/history");
  }

  if (!loaded) {
    return <Card className="h-64 animate-pulse" />;
  }

  return (
    <div className="flex flex-col gap-5 pb-24">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Log workout
        </h1>
      </header>

      <IntensitySelector value={intensity} onChange={setIntensity} />

      <Link
        href="/plans"
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-gradient-to-b from-surface-raised to-surface-raised/80 px-5 py-3.5 text-[15px] font-medium text-text shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-all hover:border-text-faint active:scale-[0.98]"
      >
        <ClipboardList size={16} />
        My Plans
      </Link>

      {draft.blocks.length === 0 && (
        <div className="flex flex-col gap-2">
          <Button variant="secondary" onClick={() => setPlanPickerOpen(true)}>
            Start from a plan
          </Button>
          <Button variant="secondary" onClick={duplicateLastSession}>
            Duplicate last session
          </Button>
        </div>
      )}

      {draft.blocks.map((block, i) => (
        <ExerciseBlock
          key={block.tempId}
          block={block}
          isFirst={i === 0}
          isLast={i === draft.blocks.length - 1}
          onAddSet={() => draft.addSet(block.tempId)}
          onUpdateSet={(setId, patch) =>
            draft.updateSet(block.tempId, setId, patch)
          }
          onRemoveSet={(setId) => draft.removeSet(block.tempId, setId)}
          onRemoveBlock={() => draft.removeBlock(block.tempId)}
          onMoveUp={() => draft.moveBlock(i, -1)}
          onMoveDown={() => draft.moveBlock(i, 1)}
        />
      ))}

      <Button
        variant="secondary"
        onClick={() => setPickerOpen(true)}
        className="flex items-center justify-center gap-1.5"
      >
        <Plus size={18} /> Add exercise
      </Button>

      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+64px)] mx-auto w-full max-w-md px-5">
        <Button
          className="w-full shadow-lg"
          disabled={draft.totalSets === 0 || saving}
          onClick={handleSave}
        >
          {saving ? "Saving…" : `Save session (${draft.totalSets} sets)`}
        </Button>
      </div>

      {pickerOpen && (
        <ExercisePicker
          exercises={exercises}
          onSelect={(ex) => {
            draft.addExercise(ex);
            setPickerOpen(false);
          }}
          onCreateCustom={addCustomExercise}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {planPickerOpen && (
        <PlanPicker
          plans={plans}
          onSelect={startFromPlan}
          onClose={() => setPlanPickerOpen(false)}
        />
      )}
    </div>
  );
}
