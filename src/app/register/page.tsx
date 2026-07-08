"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/supabase/errors";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName.trim() || null },
      },
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
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="relative mb-5 h-16 w-16">
          <div
            className="absolute inset-[-14px] rounded-full opacity-25"
            style={{
              background: "var(--color-accent)",
              filter: "blur(20px)",
            }}
          />
          <svg viewBox="0 0 100 100" className="relative h-16 w-16 -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="var(--color-surface-raised)"
              strokeWidth="9"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray="180 240"
              style={{ filter: "drop-shadow(0 0 8px var(--color-accent))" }}
            />
          </svg>
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-text">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Start tracking your skill training.
        </p>
      </div>

      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="displayName"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-muted"
            >
              Name
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
            <label
              htmlFor="password"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-muted"
            >
              Password
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
          {status === "error" && (
            <p className="text-sm text-high">{errorMessage}</p>
          )}
          <Button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent">
          Sign in
        </Link>
      </p>
    </div>
  );
}
