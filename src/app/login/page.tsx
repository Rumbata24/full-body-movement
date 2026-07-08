"use client";

import { AuthHeader } from "@/components/ui/AuthHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/supabase/errors";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

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
        title="Skill Tracker"
        subtitle="Train smart. Progress at your own pace."
      />

      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-muted"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-[15px] text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-wide text-text-muted"
              >
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-accent">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-[15px] text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
            />
          </div>
          {status === "error" && (
            <p className="text-sm text-high">{errorMessage}</p>
          )}
          <Button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-sm text-text-muted">
        New here?{" "}
        <Link href="/register" className="text-accent">
          Create an account
        </Link>
      </p>
    </div>
  );
}
