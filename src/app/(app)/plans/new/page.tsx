"use client";

import type { DraftBlock } from "@/components/log/ExerciseBlock";
import { PlanEditor } from "@/components/plan/PlanEditor";
import { Card } from "@/components/ui/Card";
import { getExercises } from "@/lib/data";
import { EXAMPLE_PLANS } from "@/lib/examplePlans";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/UserProvider";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function NewPlanFromTemplate() {
  const { user } = useUser();
  const templateKey = useSearchParams().get("template");
  const [ready, setReady] = useState(!templateKey);
  const [initialName, setInitialName] = useState("");
  const [initialBlocks, setInitialBlocks] = useState<DraftBlock[]>([]);
  const [templateNote, setTemplateNote] = useState<string | undefined>();

  useEffect(() => {
    if (!user || !templateKey) return;
    const template = EXAMPLE_PLANS.find((t) => t.key === templateKey);
    if (!template) {
      Promise.resolve().then(() => setReady(true));
      return;
    }
    getExercises(createClient()).then((exercises) => {
      const byName = new Map(exercises.map((e) => [e.name, e]));
      const blocks: DraftBlock[] = template.exercises.flatMap((spec) => {
        const exercise = byName.get(spec.exerciseName);
        if (!exercise) return [];
        return [
          {
            tempId: crypto.randomUUID(),
            exercise,
            sets: Array.from({ length: spec.sets }, () => ({
              tempId: crypto.randomUUID(),
              mode: (spec.seconds ? "duration" : "reps") as
                | "duration"
                | "reps",
              reps: spec.reps ? String(spec.reps) : "",
              duration_seconds: spec.seconds ? String(spec.seconds) : "",
              rpe: "",
              notes: "",
            })),
          },
        ];
      });
      setInitialName(template.name);
      setInitialBlocks(blocks);
      setTemplateNote(template.intensityNote);
      setReady(true);
    });
  }, [user, templateKey]);

  if (!ready) return <Card className="h-64 animate-pulse" />;

  return (
    <PlanEditor
      initialName={initialName}
      initialBlocks={initialBlocks}
      templateNote={templateNote}
    />
  );
}

export default function NewPlanPage() {
  return (
    <Suspense fallback={<Card className="h-64 animate-pulse" />}>
      <NewPlanFromTemplate />
    </Suspense>
  );
}
