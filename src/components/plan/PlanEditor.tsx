"use client";

import { ExercisePicker } from "@/components/ExercisePicker";
import { ExerciseBlock } from "@/components/log/ExerciseBlock";
import { Button } from "@/components/ui/Button";
import {
  createCustomExercise,
  createWorkoutPlan,
  deleteWorkoutPlan,
  getExercises,
  updateWorkoutPlan,
} from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/UserProvider";
import { useDraftBlocks } from "@/lib/useDraftBlocks";
import type { DraftBlock } from "@/components/log/ExerciseBlock";
import type { Exercise, ExerciseCategory } from "@/lib/types";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function PlanEditor({
  planId,
  initialName = "",
  initialBlocks = [],
}: {
  planId?: string;
  initialName?: string;
  initialBlocks?: DraftBlock[];
}) {
  const { user } = useUser();
  const router = useRouter();

  const [name, setName] = useState(initialName);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const draft = useDraftBlocks();

  useEffect(() => {
    if (initialBlocks.length) draft.setBlocks(initialBlocks);
    // Seed once from the plan being edited; draft intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) return;
    getExercises(createClient()).then(setExercises);
  }, [user]);

  async function addCustomExercise(
    exerciseName: string,
    category: ExerciseCategory,
  ) {
    if (!user) return;
    const supabase = createClient();
    const exercise = await createCustomExercise(supabase, user.id, {
      name: exerciseName,
      category,
    });
    setExercises((prev) => [...prev, exercise]);
    draft.addExercise(exercise);
    setPickerOpen(false);
  }

  async function handleSave() {
    if (!user || !name.trim() || draft.totalSets === 0) return;
    setSaving(true);
    const supabase = createClient();
    const payload = { name: name.trim(), sets: draft.flattenToSets() };
    if (planId) {
      await updateWorkoutPlan(supabase, planId, payload);
    } else {
      await createWorkoutPlan(supabase, payload);
    }
    router.push("/plans");
  }

  async function handleDelete() {
    if (!planId) return;
    if (!confirm("Delete this plan?")) return;
    setDeleting(true);
    await deleteWorkoutPlan(createClient(), planId);
    router.push("/plans");
  }

  return (
    <div className="flex flex-col gap-5 pb-24">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          {planId ? "Edit plan" : "New plan"}
        </h1>
      </header>

      <div>
        <label
          htmlFor="plan-name"
          className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-muted"
        >
          Plan name
        </label>
        <input
          id="plan-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Push Day"
          className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-[15px] text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
        />
      </div>

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

      {planId && (
        <Button
          variant="ghost"
          onClick={handleDelete}
          disabled={deleting}
          className="!text-high"
        >
          {deleting ? "Deleting…" : "Delete plan"}
        </Button>
      )}

      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+64px)] mx-auto w-full max-w-md px-5">
        <Button
          className="w-full shadow-lg"
          disabled={!name.trim() || draft.totalSets === 0 || saving}
          onClick={handleSave}
        >
          {saving ? "Saving…" : "Save plan"}
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
    </div>
  );
}
