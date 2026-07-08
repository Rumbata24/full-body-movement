import type { FeelingLevel, IntensityLevel } from "./types";

export const INTENSITY_META: Record<
  IntensityLevel,
  { label: string; blurb: string; color: string; colorSoft: string }
> = {
  high: {
    label: "High",
    blurb: "Near-max attempts on your skills.",
    color: "var(--color-high)",
    colorSoft: "var(--color-high-soft)",
  },
  moderate: {
    label: "Moderate",
    blurb: "Solid working volume, not maximal.",
    color: "var(--color-moderate)",
    colorSoft: "var(--color-moderate-soft)",
  },
  recovery: {
    label: "Recovery",
    blurb: "Light mobility, skill work, or full rest.",
    color: "var(--color-recovery)",
    colorSoft: "var(--color-recovery-soft)",
  },
};

export const FEELING_META: Record<
  FeelingLevel,
  { label: string; emoji: string }
> = {
  fresh: { label: "Fresh", emoji: "\u{1F60A}" },
  okay: { label: "Okay", emoji: "\u{1F642}" },
  tired: { label: "Tired", emoji: "\u{1F62A}" },
  sore: { label: "Sore", emoji: "\u{1F915}" },
  wiped: { label: "Wiped", emoji: "\u{1F975}" },
};

export const FEELING_ORDER: FeelingLevel[] = [
  "fresh",
  "okay",
  "tired",
  "sore",
  "wiped",
];

export const INTENSITY_ORDER: IntensityLevel[] = [
  "recovery",
  "moderate",
  "high",
];

/**
 * Suggests today's intensity from the planned day and how the user feels.
 * Only ever downgrades relative to the plan — the app never suggests going
 * harder than planned. The user always has final say via override.
 */
export function suggestIntensity(
  planned: IntensityLevel,
  feeling: FeelingLevel,
): IntensityLevel {
  if (feeling === "wiped") return "recovery";

  if (feeling === "sore") {
    return planned === "recovery" ? "recovery" : planned === "high" ? "moderate" : "recovery";
  }

  if (feeling === "tired") {
    return planned === "high" ? "moderate" : planned;
  }

  return planned; // fresh, okay
}

export function dayOfWeekFromDate(date: Date): number {
  return date.getDay(); // 0 = Sunday .. 6 = Saturday
}

export const DAY_LABELS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;
