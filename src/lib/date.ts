import { addDays, format, startOfWeek } from "date-fns";

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatFriendly(dateISO: string): string {
  return format(new Date(`${dateISO}T00:00:00`), "EEE, MMM d");
}

export function currentWeekDates(): Date[] {
  const start = startOfWeek(new Date(), { weekStartsOn: 0 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}
