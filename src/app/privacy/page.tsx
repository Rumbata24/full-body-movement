import { Card } from "@/components/ui/Card";
import Link from "next/link";

export const metadata = {
  title: "Privacy & Terms — Skill Tracker",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-2">
      <h2 className="text-[15px] font-medium">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-text-muted">
        {children}
      </div>
    </Card>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Privacy &amp; Terms
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Skill Tracker is a small, personal-use beta. Here&rsquo;s what that
          means for your data.
        </p>
      </header>

      <Section title="What we collect">
        <p>
          Your email address and, optionally, a display name — used only to
          sign you in and greet you by name. Your workout data: check-ins,
          logged sessions and sets, custom exercises, and any workout plans
          you build. That&rsquo;s all — no analytics trackers, no ad
          identifiers, no third-party data brokers.
        </p>
      </Section>

      <Section title="How it's stored">
        <p>
          Everything lives in a Supabase (Postgres) database. Every table is
          scoped with row-level security so your data is only ever readable
          or writable by your own account, enforced by the database itself,
          not just the app&rsquo;s code.
        </p>
      </Section>

      <Section title="How it's used">
        <p>
          Solely to run the app for you: showing your history, charting your
          progress, and suggesting training intensity. We don&rsquo;t sell,
          share, or use your data for advertising. This is a beta among
          people we know personally — not a public product yet.
        </p>
      </Section>

      <Section title="Your data, your call">
        <p>
          You can export a full copy of your data or permanently delete your
          account and everything tied to it from the{" "}
          <Link href="/profile" className="text-accent">
            Profile
          </Link>{" "}
          screen at any time. Account deletion is immediate and cannot be
          undone.
        </p>
      </Section>

      <Section title="Terms of use">
        <p>
          Skill Tracker is provided as-is, in active beta, with no uptime or
          accuracy guarantees. It suggests training intensity based on your
          own check-ins — it&rsquo;s not medical or professional coaching
          advice. Train within your own limits and judgment.
        </p>
      </Section>

      <Section title="Questions or data requests">
        <p>
          Reach out at{" "}
          <a href="mailto:nemur999@gmail.com" className="text-accent">
            nemur999@gmail.com
          </a>
          .
        </p>
      </Section>

      <p className="text-center text-xs text-text-faint">
        Last updated 2026-07-12.
      </p>
    </div>
  );
}
