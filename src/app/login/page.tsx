"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setStatus(error ? "error" : "sent");
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
          Skill Tracker
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Train smart. Progress at your own pace.
        </p>
      </div>

      <Card className="w-full max-w-sm">
        {status === "sent" ? (
          <div className="py-4 text-center">
            <p className="text-[15px] text-text">Check your inbox</p>
            <p className="mt-2 text-sm text-text-muted">
              We sent a sign-in link to <span className="text-text">{email}</span>.
            </p>
          </div>
        ) : (
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
            {status === "error" && (
              <p className="text-sm text-high">
                Something went wrong. Try again.
              </p>
            )}
            <Button type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send magic link"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
