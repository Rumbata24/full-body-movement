"use client";

import { AuthHeader } from "@/components/ui/AuthHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/supabase/errors";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMessage("Passwords don't match.");
      return;
    }

    setStatus("sending");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
      setErrorMessage(friendlyAuthError(error));
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <AuthHeader
        title="Choose a new password"
        subtitle="You'll stay signed in on this device."
      />

      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-muted"
            >
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 10 characters"
              className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-[15px] text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
            />
            <p className="mt-2 text-xs text-text-faint">
              Include lowercase, uppercase, a number, and a symbol.
            </p>
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-muted"
            >
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-[15px] text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
            />
          </div>
          {status === "error" && (
            <p className="text-sm text-high">{errorMessage}</p>
          )}
          <Button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Saving…" : "Save new password"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
