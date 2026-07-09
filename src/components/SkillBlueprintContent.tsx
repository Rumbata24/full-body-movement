"use client";

import { Card } from "@/components/ui/Card";
import { INTENSITY_META } from "@/lib/intensity";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="flex flex-col gap-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between rounded-2xl border border-border bg-surface-raised/60 px-4 py-3 text-left transition-colors active:scale-[0.99]"
      >
        <span className="font-[family-name:var(--font-display)] text-[15px] font-semibold">
          {title}
        </span>
        <ChevronDown
          size={16}
          className={clsx(
            "shrink-0 text-text-faint transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-text-muted">{children}</p>;
}

export function SkillBlueprintContent() {
  return (
    <div className="flex flex-col gap-4">
      <P>
        You already know the exercises. What keeps people stuck isn&apos;t a
        missing exercise, it&apos;s{" "}
        <strong className="text-text">how</strong>{" "}
        they train — how the week is structured, when to push, when to hold
        back, and how much attention goes into detail. The biggest trap is
        &quot;no pain, no gain&quot;: training harder and more often feels
        productive, but it&apos;s what caps progress and causes plateaus and
        injuries. Build the foundation properly and results follow.
      </P>

      <Section title="Why most people plateau">
        <div className="flex flex-col gap-3">
          <Card className="flex flex-col gap-1">
            <p className="text-[15px] font-medium">Same intensity, every time</p>
            <P>
              Always going hard feels hard-working, but your nervous system
              can&apos;t absorb constant maximum stress. Always going easy means
              you never overload. You need both, on purpose.
            </P>
          </Card>
          <Card className="flex flex-col gap-1">
            <p className="text-[15px] font-medium">No weekly structure</p>
            <P>Walking in and &quot;going with the flow&quot; every session isn&apos;t a plan.</P>
          </Card>
          <Card className="flex flex-col gap-1">
            <p className="text-[15px] font-medium">Ignoring the nervous system</p>
            <P>
              This is a neural sport as much as a muscular one. A session
              isn&apos;t &quot;good&quot; just because you&apos;re wrecked
              afterward — your brain fatigues even when your muscles don&apos;t.
            </P>
          </Card>
          <Card className="flex flex-col gap-1">
            <p className="text-[15px] font-medium">No technical intention</p>
            <P>
              Throwing yourself at the full skill with no plan for shoulder
              position, grip, or hip/leg engagement just burns reps and bakes
              in bad habits.
            </P>
          </Card>
        </div>
      </Section>

      <Section title="Three rules every session follows">
        <div className="flex flex-col gap-3">
          <Card className="flex flex-col gap-1">
            <p className="text-[15px] font-medium">1. Specificity</p>
            <P>
              Use 3–4 exercises max that directly mimic your goal skill.
              Planche → straight-arm shoulder flexion work. Front lever →
              straight-arm shoulder extension work. Drop accessories that
              don&apos;t match what the skill demands.
            </P>
          </Card>
          <Card className="flex flex-col gap-1">
            <p className="text-[15px] font-medium">2. Fatigue management</p>
            <P>
              Balance three dials: frequency (sessions/week), volume
              (sets/session), intensity (difficulty per set). Too much of any
              is overtraining; too little is undertraining — both stall you.
              Most people overtrain without realizing it, because muscle
              soreness hides neural fatigue.
            </P>
          </Card>
          <Card className="flex flex-col gap-1">
            <p className="text-[15px] font-medium">3. Progressive overload</p>
            <P>
              Overload by changing one variable at a time — rest times, reps,
              sets, resistance, or hold duration. Track a couple of simple
              benchmarks (a hold time, how explosive a movement feels) so you
              always know, honestly, whether you&apos;re improving.
            </P>
          </Card>
        </div>
        <P>
          <strong className="text-text">Intensity</strong>, simply defined: a
          set&apos;s difficulty as a percentage of your max. Best hold is 10s,
          you do 6s — that&apos;s a 60% set.
        </P>
      </Section>

      <Section title="The three kinds of days">
        <div className="flex flex-col gap-3">
          <Card className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: INTENSITY_META.high.color }}
              />
              <span
                className="text-[15px] font-medium"
                style={{ color: INTENSITY_META.high.color }}
              >
                Max days — 80–100%
              </span>
            </div>
            <P>
              1–2x/week, 2–3 skill attempts max. Short and very intensive to
              test your limits and force real nervous-system adaptation. More
              than a few attempts just fries you. Warm up 5–10 min, do your
              attempts, then a volume/accessory block.
            </P>
          </Card>
          <Card className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: INTENSITY_META.moderate.color }}
              />
              <span
                className="text-[15px] font-medium"
                style={{ color: INTENSITY_META.moderate.color }}
              >
                Submax days — 50–80%
              </span>
            </div>
            <P>
              2–3x/week. This is where most real progress happens — repeated,
              safe exposure to the movement pattern. The instant you feel
              yourself about to strain, stop the set. Not chasing the limit is
              the hardest and most important part.
            </P>
          </Card>
          <Card className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: INTENSITY_META.recovery.color }}
              />
              <span
                className="text-[15px] font-medium"
                style={{ color: INTENSITY_META.recovery.color }}
              >
                Rest days
              </span>
            </div>
            <P>
              Recovery and adaptation happen between sessions, not during
              them. Active rest (10–20% effort — walk, light mobility) boosts
              blood flow to muscles, joints and tendons, which get less blood
              flow than muscle and need the help; full rest is doing nothing
              when you need it. Keep at least one rest day between two max
              days.
            </P>
          </Card>
        </div>
        <P>
          Sample week: submax → max → rest → submax → submax → rest → submax.
          The submax day before a max day primes your body, like warming up
          an engine before revving it. Some weeks won&apos;t hit a max day at
          all, and that&apos;s fine — consistency over months beats intensity
          over days.
        </P>
      </Section>

      <Section title="Why timing matters: supercompensation">
        <P>
          Training drops you into a temporarily weakened (fatigued) state.
          Recover, and you don&apos;t just return to baseline — you rise above
          it, temporarily stronger. Time your next hard session to land at
          that peak, and you climb.
        </P>
        <div className="flex flex-col gap-2">
          <Card className="flex flex-col gap-1">
            <p className="text-[15px] font-medium">Too soon</p>
            <P>Still recovering → you spiral downward. Overtraining.</P>
          </Card>
          <Card className="flex flex-col gap-1">
            <p className="text-[15px] font-medium">Too late</p>
            <P>Already back to baseline → no net progress. Plateau.</P>
          </Card>
          <Card className="flex flex-col gap-1">
            <p className="text-[15px] font-medium">Just right</p>
            <P>You climb, session after session.</P>
          </Card>
        </div>
        <P>
          This is exactly what the three day-types do: max days cash in
          progress at the peak, submax days raise how high the next peak can
          go, and a recovery day placed right after a hard session shortens
          the dip so you supercompensate sooner.
        </P>
      </Section>

      <Section title="Spreading intensity within a session">
        <div className="flex flex-col gap-3">
          <Card className="flex flex-col gap-1">
            <p className="text-[15px] font-medium">Step loading</p>
            <P>
              Ramp gradually — 50%, 60%, 70%, up to ~85%, then 2–3 sets there.
              Simple, low-fatigue. Best for beginners.
            </P>
          </Card>
          <Card className="flex flex-col gap-1">
            <p className="text-[15px] font-medium">Variable loading</p>
            <P>
              Alternate hard, easy, hard, easy. Easy sets act as active
              recovery so neural fatigue doesn&apos;t pile up.
            </P>
          </Card>
          <Card className="flex flex-col gap-1">
            <p className="text-[15px] font-medium">Wave loading</p>
            <P>
              Build intensity in waves, each peaking higher (up to 90–100%),
              back off, climb again. Primes the nervous system (post-activation
              potentiation) to hit harder sets than it otherwise could. Most
              advanced — use once step and variable loading feel easy.
            </P>
          </Card>
        </div>
      </Section>

      <Section title="When to progress">
        <P>
          Move to the next progression only when you can hold the current one
          for{" "}
          <strong className="text-text">8–10 seconds with clean form</strong>
          {" "}— no bent elbows, no arching or rounding the back, no sloppy
          lower-body engagement.
        </P>
        <P>
          One level at a time — skipping progressions is how people get stuck
          for years; small steps compound faster than skipping foundations
          that later collapse. And form depends on context: skill holds and
          attempts must be clean, but in pure volume/strength blocks (presses,
          push-ups), chasing a couple extra reps with looser form is fine.
        </P>
      </Section>

      <Section title="Strength skills vs. coordination skills">
        <Card className="flex flex-col gap-1.5">
          <p className="text-[15px] font-medium">
            Strength skills — planche, front lever, maltese
          </p>
          <P>
            Limited by force production. Follow the day-structure above:
            mostly submax volume, 1–2 true max sessions/week, careful
            recovery timing.
          </P>
        </Card>
        <Card className="flex flex-col gap-1.5">
          <p className="text-[15px] font-medium">
            Coordination skills — handstand, muscle-up
          </p>
          <P>
            Force is rarely the bottleneck; the skill itself is. Train daily
            (5–7x/week) at only ~50% of the volume you could tolerate, every
            set under ~60% intensity, on the exact movement — not substitute
            drills. More frequent, low-fatigue exposure beats fewer heavy
            sessions here.
          </P>
        </Card>
      </Section>

      <Section title="The real multiplier: attention to detail">
        <P>
          The program is maybe 1% of the equation. Attention to detail is the
          other 99%. Small invisible mistakes — like confusing shoulder
          protraction with rounding the spine — can stall someone for months
          while they think they&apos;re doing it right.
        </P>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-text-muted">
          <li>Put real intention into every rep, even before form is perfect.</li>
          <li>Fix one habit at a time — don&apos;t let a mistake survive past one session.</li>
          <li>Get outside eyes on your footage; what feels right is often wrong.</li>
          <li>
            Rest several minutes between sets — it recharges your short-burst
            energy system (3–8 min) and makes you more deliberate on the next
            set.
          </li>
          <li>
            Leverage matters: a fingertip planche is actually easier than a
            floor planche — the extended arm gives a longer lever and needs
            far less wrist mobility.
          </li>
        </ul>
      </Section>

      <Section title="Building real mastery">
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-text-muted">
          <li>Build the hold first — presses, push-ups, and grip variations all derive from a strong static hold.</li>
          <li>After skill attempts, add a few sets of dynamic + accessory work to build strength through the full range.</li>
          <li>Don&apos;t rely only on bands — tendons still need raw bodyweight exposure to adapt.</li>
          <li>Attack a new pattern from several angles (banded, bodyweight, tempos) so your nervous system adapts faster.</li>
        </ul>
      </Section>

      <Section title="Training around a busy life">
        <P>
          Work drains the same nervous system you train with — a demanding
          job means you need more rest, not less.
        </P>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-text-muted">
          <li>Skip max days when work stress is high or sleep was poor — staying consistent with submax work beats risking burnout.</li>
          <li>
            Can&apos;t get one training block? Spread submax sets across the
            day (morning, midday, evening) instead — but keep it to submax
            work, since there&apos;s no time to warm up properly before each
            mini-session.
          </li>
          <li>Treat rest and sleep as non-negotiable. Shift your week around your life, not the other way around.</li>
        </ul>
        <P>
          Track sets, reps, hold times, and how you felt — that&apos;s what
          this app is for. It&apos;s what lets your plan adapt intelligently
          to real data about you, instead of guessing.
        </P>
      </Section>
    </div>
  );
}
