"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IntensityBadge } from "@/components/ui/IntensityBadge";
import { formatFriendly } from "@/lib/date";
import { deleteSession, getSession } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/UserProvider";
import type { SessionWithSets } from "@/lib/types";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const { user } = useUser();
  const router = useRouter();
  const [session, setSession] = useState<SessionWithSets | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!user) return;
    getSession(createClient(), sessionId).then(setSession);
  }, [user, sessionId]);

  async function handleDelete() {
    if (!confirm("Delete this session?")) return;
    await deleteSession(createClient(), sessionId);
    router.push("/history");
  }

  if (session === undefined) return <Card className="h-64 animate-pulse" />;
  if (session === null)
    return <p className="text-sm text-text-muted">Session not found.</p>;

  const byExercise = new Map<string, typeof session.set_logs>();
  for (const setLog of [...session.set_logs].sort(
    (a, b) => a.order_index - b.order_index,
  )) {
    if (!byExercise.has(setLog.exercise_id))
      byExercise.set(setLog.exercise_id, []);
    byExercise.get(setLog.exercise_id)!.push(setLog);
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">
            {formatFriendly(session.date)}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold">
            Session
          </h1>
        </div>
        <IntensityBadge intensity={session.intensity} />
      </header>

      {Array.from(byExercise.entries()).map(([exerciseId, sets]) => (
        <Card key={exerciseId} className="flex flex-col gap-2">
          <p className="text-[15px] font-medium">{sets[0].exercise.name}</p>
          <div className="flex flex-col gap-1.5">
            {sets.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-xl bg-bg-soft/60 px-3 py-2 text-sm text-text-muted"
              >
                <span className="w-4 text-text-faint">{i + 1}</span>
                <span className="font-medium tabular-nums text-text">
                  {s.reps !== null ? `${s.reps} reps` : `${s.duration_seconds}s`}
                </span>
                {s.rpe !== null && <span>RPE {s.rpe}</span>}
                {s.notes && <span className="italic">{s.notes}</span>}
              </div>
            ))}
          </div>
        </Card>
      ))}

      {session.notes && (
        <Card>
          <p className="text-sm text-text-muted">{session.notes}</p>
        </Card>
      )}

      <Button variant="ghost" onClick={handleDelete} className="!text-high">
        Delete session
      </Button>
    </div>
  );
}
