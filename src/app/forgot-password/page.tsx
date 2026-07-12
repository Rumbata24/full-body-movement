"use client";

import { AuthHeader } from "@/components/ui/AuthHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Turnstile } from "@/components/ui/Turnstile";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/supabase/errors";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      captchaToken,
    });

    if (error) {
      setStatus("error");
      setErrorMessage(friendlyAuthError(error));
      setCaptchaToken("");
      return;
    }

    setStatus("sent");
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <AuthHeader
        title="Reset your password"
        subtitle="We'll email you a link to choose a new one."
      />

      <Card className="w-full max-w-sm">
        {status === "sent" ? (
          <div className="py-4 text-center">
            <p className="text-[15px] text-text">Check your inbox</p>
            <p className="mt-2 text-sm text-text-muted">
              If an account exists for{" "}
              <span className="text-text">{email}</span>, we sent a link to
              reset your password.
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
            <Turnstile onVerify={setCaptchaToken} />
            {status === "error" && (
              <p className="text-sm text-high">{errorMessage}</p>
            )}
            <Button
              type="submit"
              disabled={status === "sending" || !captchaToken}
            >
              {status === "sending" ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}
      </Card>

      <p className="mt-6 text-sm text-text-muted">
        <Link href="/login" className="text-accent">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
