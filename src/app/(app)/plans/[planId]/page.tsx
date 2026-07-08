"use client";

import { PlanEditor } from "@/components/plan/PlanEditor";
import { Card } from "@/components/ui/Card";
import { getWorkoutPlan } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/UserProvider";
import { setsToBlocks } from "@/lib/useDraftBlocks";
import type { WorkoutPlanWithSets } from "@/lib/types";
import { use, useEffect, useState } from "react";

export default function EditPlanPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = use(params);
  const { user } = useUser();
  const [plan, setPlan] = useState<WorkoutPlanWithSets | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!user) return;
    getWorkoutPlan(createClient(), planId).then(setPlan);
  }, [user, planId]);

  if (plan === undefined) return <Card className="h-64 animate-pulse" />;
  if (plan === null)
    return <p className="text-sm text-text-muted">Plan not found.</p>;

  return (
    <PlanEditor
      planId={plan.id}
      initialName={plan.name}
      initialBlocks={setsToBlocks(plan.plan_sets)}
    />
  );
}
