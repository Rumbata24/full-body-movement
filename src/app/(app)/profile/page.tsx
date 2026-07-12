"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  deleteOwnAccount,
  exportUserData,
  getProfile,
  updateProfile,
} from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/supabase/errors";
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

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [passwordError, setPasswordError] = useState("");

  const [exporting, setExporting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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

  async function handleExport() {
    setExporting(true);
    try {
      const supabase = createClient();
      const data = await exportUserData(supabase);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `skill-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAccount() {
    setConfirmDeleteOpen(false);
    setDeleting(true);
    setDeleteError("");
    try {
      const supabase = createClient();
      await deleteOwnAccount(supabase);
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      setDeleting(false);
      setDeleteError(
        err instanceof Error ? err.message : "Couldn't delete account.",
      );
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setPasswordStatus("error");
      setPasswordError("New passwords don't match.");
      return;
    }

    setPasswordStatus("saving");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      current_password: currentPassword,
    });

    if (error) {
      setPasswordStatus("error");
      setPasswordError(friendlyAuthError(error));
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordStatus("saved");
    setTimeout(() => setPasswordStatus("idle"), 2000);
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

      <Card className="flex flex-col gap-4">
        <h2 className="text-[15px] font-medium">Change password</h2>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-muted"
            >
              Current password
            </label>
            <input
              id="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-[15px] text-text focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="newPassword"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-muted"
            >
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 10 characters"
              className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-[15px] text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
            />
            <p className="mt-2 text-xs text-text-faint">
              Include lowercase, uppercase, a number, and a symbol.
            </p>
          </div>
          <div>
            <label
              htmlFor="confirmNewPassword"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-muted"
            >
              Confirm new password
            </label>
            <input
              id="confirmNewPassword"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-[15px] text-text focus:border-accent focus:outline-none"
            />
          </div>
          {passwordStatus === "error" && (
            <p className="text-sm text-high">{passwordError}</p>
          )}
          <Button
            type="submit"
            variant="secondary"
            disabled={passwordStatus === "saving"}
          >
            {passwordStatus === "saving"
              ? "Saving…"
              : passwordStatus === "saved"
                ? "Saved"
                : "Update password"}
          </Button>
        </form>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-[15px] font-medium">Your data</h2>
        <p className="text-sm text-text-muted">
          Download a copy of everything stored under your account — profile,
          check-ins, sessions, custom exercises, and workout plans.
        </p>
        <Button variant="secondary" onClick={handleExport} disabled={exporting}>
          {exporting ? "Preparing export…" : "Export my data"}
        </Button>
      </Card>

      <Button variant="secondary" onClick={handleSignOut} disabled={signingOut}>
        {signingOut ? "Signing out…" : "Sign out"}
      </Button>

      <Card className="flex flex-col gap-4 border-high/30">
        <h2 className="text-[15px] font-medium text-high">Danger zone</h2>
        <p className="text-sm text-text-muted">
          Permanently delete your account and all associated data. This
          can&rsquo;t be undone.
        </p>
        {deleteError && <p className="text-sm text-high">{deleteError}</p>}
        <Button
          onClick={() => setConfirmDeleteOpen(true)}
          disabled={deleting}
          className="!bg-high !shadow-[0_8px_24px_-8px_var(--color-high)]"
        >
          {deleting ? "Deleting account…" : "Delete my account"}
        </Button>
      </Card>

      {confirmDeleteOpen && (
        <ConfirmDialog
          title="Delete your account?"
          description="This permanently deletes your profile, check-ins, sessions, and plans. This can't be undone."
          confirmLabel="Delete account"
          onConfirm={handleDeleteAccount}
          onCancel={() => setConfirmDeleteOpen(false)}
        />
      )}
    </div>
  );
}
