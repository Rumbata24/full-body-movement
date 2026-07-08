"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getProfile, updateProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/UserProvider";
import type { Profile } from "@/lib/types";
import { clsx } from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    getProfile(supabase).then((p) => {
      if (!p) return;
      setProfile(p);
      setDisplayName(p.display_name ?? "");
      setUnits(p.units);
    });
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    const updated = await updateProfile(supabase, user.id, {
      display_name: displayName.trim() || null,
      units,
    });
    setProfile(updated);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (!profile) {
    return <Card className="h-64 animate-pulse" />;
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Profile
        </h1>
      </header>

      <Card className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="displayName"
            className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-muted"
          >
            Display name
          </label>
          <input
            id="displayName"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-[15px] text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <p className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-muted">
            Email
          </p>
          <p className="rounded-xl border border-border bg-surface-raised px-4 py-3 text-[15px] text-text-muted">
            {user?.email}
          </p>
        </div>

        <div>
          <p className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-muted">
            Units
          </p>
          <div className="flex gap-2">
            {(["metric", "imperial"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnits(u)}
                className={clsx(
                  "flex-1 rounded-xl border px-4 py-3 text-[15px] font-medium capitalize transition-colors",
                  units === u
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border bg-surface-raised text-text-muted",
                )}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
        </Button>
      </Card>

      <Button variant="secondary" onClick={handleSignOut} disabled={signingOut}>
        {signingOut ? "Signing out…" : "Sign out"}
      </Button>
    </div>
  );
}
