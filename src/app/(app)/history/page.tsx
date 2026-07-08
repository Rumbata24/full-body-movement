"use client";

import { Card } from "@/components/ui/Card";
import { IntensityBadge } from "@/components/ui/IntensityBadge";
import { formatFriendly } from "@/lib/date";
import { getRecentSessions } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/UserProvider";
import type { SessionWithSets } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HistoryPage() {
  const { user } = useUser();
  const [sessions, setSessions] = useState<SessionWithSets[] | null>(null);

  useEffect(() => {
    if (!user) return;
    getRecentSessions(createClient(), 50).then(setSessions);
  }, [user]);

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          History
        </h1>
      </header>

      {!sessions ? (
        <Card className="h-32 animate-pulse" />
      ) : sessions.length === 0 ? (
        <p className="py-10 text-center text-sm text-text-muted">
          No sessions logged yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => {
            const exerciseNames = Array.from(
              new Set(session.set_logs.map((s) => s.exercise.name)),
            );
            return (
              <Link
                key={session.id}
                href={`/history/${session.id}`}
                className="block transition-transform active:scale-[0.98]"
              >
                <Card className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[15px] font-medium">
                      {formatFriendly(session.date)}
                    </p>
                    <IntensityBadge intensity={session.intensity} size="sm" />
                  </div>
                  <p className="line-clamp-1 text-sm text-text-muted">
                    {exerciseNames.join(", ") || "No exercises logged"}
                  </p>
                  <p className="text-xs text-text-faint">
                    {session.set_logs.length} sets
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
