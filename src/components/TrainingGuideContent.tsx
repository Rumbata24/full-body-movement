import { Card } from "@/components/ui/Card";
import { INTENSITY_META } from "@/lib/intensity";
import type { IntensityLevel } from "@/lib/types";

const GUIDE: Record<
  IntensityLevel,
  { range: string; frequency: string; detail: string }
> = {
  high: {
    range: "80–100%",
    frequency: "1–2x / week",
    detail:
      "Near-max attempts on your skills — the days you actually move progressions forward. Needs full recovery before and after, so don't stack these back-to-back.",
  },
  moderate: {
    range: "60–70%",
    frequency: "Most days",
    detail:
      "Solid working volume without grinding to failure. This is where most of your week should live — it builds the base the high days cash in on.",
  },
  recovery: {
    range: "—",
    frequency: "1–2x / week",
    detail:
      "Light mobility, easy skill work, or full rest. Not a punishment day — it's what lets the next high day actually be high.",
  },
};

export function TrainingGuideContent() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-muted">
        A rough guide for balancing your week — not a rigid schedule. Plan
        your days around this, then let how you actually feel at check-in
        have the final say.
      </p>

      <div className="flex flex-col gap-3">
        {(Object.keys(GUIDE) as IntensityLevel[]).map((level) => {
          const meta = INTENSITY_META[level];
          const g = GUIDE[level];
          return (
            <Card key={level} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: meta.color }}
                  />
                  <span
                    className="text-[15px] font-medium"
                    style={{ color: meta.color }}
                  >
                    {meta.label}
                  </span>
                </div>
                <span className="text-xs text-text-faint">{g.frequency}</span>
              </div>
              {g.range !== "—" && (
                <p className="text-xs text-text-faint">
                  ~{g.range} of your max effort
                </p>
              )}
              <p className="text-sm text-text-muted">{g.detail}</p>
            </Card>
          );
        })}
      </div>

      <Card raised className="flex flex-col gap-1.5">
        <p className="text-[15px] font-medium">A typical week</p>
        <p className="text-sm text-text-muted">
          1–2 high days, 1–2 recovery days, and the rest moderate. It&apos;s a
          starting point, not a rule — some weeks lean more moderate, some
          need an extra recovery day. Watch your weekly view for patterns,
          like consistently downgrading the same day.
        </p>
      </Card>
    </div>
  );
}
