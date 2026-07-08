"use client";

import { Card } from "@/components/ui/Card";
import type { Exercise } from "@/lib/types";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { DraftSetInput, SetRow } from "./SetRow";

export interface DraftBlock {
  tempId: string;
  exercise: Exercise;
  sets: DraftSetInput[];
}

export function ExerciseBlock({
  block,
  isFirst,
  isLast,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  onRemoveBlock,
  onMoveUp,
  onMoveDown,
}: {
  block: DraftBlock;
  isFirst: boolean;
  isLast: boolean;
  onAddSet: () => void;
  onUpdateSet: (tempId: string, patch: Partial<DraftSetInput>) => void;
  onRemoveSet: (tempId: string) => void;
  onRemoveBlock: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[15px] font-medium text-text">
            {block.exercise.name}
          </p>
          {block.exercise.progression_stage && (
            <p className="text-xs text-text-faint capitalize">
              {block.exercise.progression_stage.replace(/_/g, " ")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 text-text-faint">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 disabled:opacity-30"
            aria-label="Move up"
          >
            <ChevronUp size={18} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 disabled:opacity-30"
            aria-label="Move down"
          >
            <ChevronDown size={18} />
          </button>
          <button
            type="button"
            onClick={onRemoveBlock}
            className="p-1"
            aria-label="Remove exercise"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border/60 pt-3">
        {block.sets.map((set, i) => (
          <SetRow
            key={set.tempId}
            set={set}
            index={i}
            onChange={(patch) => onUpdateSet(set.tempId, patch)}
            onRemove={() => onRemoveSet(set.tempId)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddSet}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-sm font-medium text-text-muted"
      >
        <Plus size={16} /> Add set
      </button>
    </Card>
  );
}
