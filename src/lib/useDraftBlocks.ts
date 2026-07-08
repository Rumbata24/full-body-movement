"use client";

import type { DraftBlock } from "@/components/log/ExerciseBlock";
import type { DraftSetInput } from "@/components/log/SetRow";
import { useState } from "react";
import type { DraftSet } from "./data";
import type { Exercise } from "./types";

function newSet(): DraftSetInput {
  return {
    tempId: crypto.randomUUID(),
    mode: "reps",
    reps: "",
    duration_seconds: "",
    rpe: "",
    notes: "",
  };
}

/** Shared exercise-block editing state, used by both the Log screen and the Plan editor. */
export function useDraftBlocks() {
  const [blocks, setBlocks] = useState<DraftBlock[]>([]);

  function addExercise(exercise: Exercise) {
    setBlocks((prev) => [
      ...prev,
      { tempId: crypto.randomUUID(), exercise, sets: [newSet()] },
    ]);
  }

  function addSet(blockId: string) {
    setBlocks((prev) =>
      prev.map((b) =>
        b.tempId === blockId ? { ...b, sets: [...b.sets, newSet()] } : b,
      ),
    );
  }

  function updateSet(
    blockId: string,
    setId: string,
    patch: Partial<DraftSetInput>,
  ) {
    setBlocks((prev) =>
      prev.map((b) =>
        b.tempId !== blockId
          ? b
          : {
              ...b,
              sets: b.sets.map((s) =>
                s.tempId === setId ? { ...s, ...patch } : s,
              ),
            },
      ),
    );
  }

  function removeSet(blockId: string, setId: string) {
    setBlocks((prev) =>
      prev.map((b) =>
        b.tempId === blockId
          ? { ...b, sets: b.sets.filter((s) => s.tempId !== setId) }
          : b,
      ),
    );
  }

  function removeBlock(blockId: string) {
    setBlocks((prev) => prev.filter((b) => b.tempId !== blockId));
  }

  function moveBlock(index: number, dir: -1 | 1) {
    setBlocks((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const totalSets = blocks.reduce((sum, b) => sum + b.sets.length, 0);

  function flattenToSets(): DraftSet[] {
    const sets: DraftSet[] = [];
    let order = 0;
    for (const block of blocks) {
      for (const s of block.sets) {
        const reps = s.mode === "reps" ? parseInt(s.reps, 10) : NaN;
        const duration =
          s.mode === "duration" ? parseInt(s.duration_seconds, 10) : NaN;
        if (Number.isNaN(reps) && Number.isNaN(duration)) continue;
        sets.push({
          exercise_id: block.exercise.id,
          order_index: order++,
          reps: Number.isNaN(reps) ? null : reps,
          duration_seconds: Number.isNaN(duration) ? null : duration,
          rpe: s.rpe ? parseInt(s.rpe, 10) : null,
          notes: s.notes || null,
        });
      }
    }
    return sets;
  }

  return {
    blocks,
    setBlocks,
    addExercise,
    addSet,
    updateSet,
    removeSet,
    removeBlock,
    moveBlock,
    totalSets,
    flattenToSets,
  };
}

/** Groups a flat list of sets (from a past session or a saved plan) back into editable blocks. */
export function setsToBlocks<
  T extends {
    exercise_id: string;
    exercise: Exercise;
    order_index: number;
    reps: number | null;
    duration_seconds: number | null;
  },
>(sets: T[]): DraftBlock[] {
  const byExercise = new Map<string, DraftBlock>();
  for (const s of [...sets].sort((a, b) => a.order_index - b.order_index)) {
    if (!byExercise.has(s.exercise_id)) {
      byExercise.set(s.exercise_id, {
        tempId: crypto.randomUUID(),
        exercise: s.exercise,
        sets: [],
      });
    }
    byExercise.get(s.exercise_id)!.sets.push({
      tempId: crypto.randomUUID(),
      mode: s.duration_seconds !== null ? "duration" : "reps",
      reps: s.reps?.toString() ?? "",
      duration_seconds: s.duration_seconds?.toString() ?? "",
      rpe: "",
      notes: "",
    });
  }
  return Array.from(byExercise.values());
}
