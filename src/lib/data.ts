import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CheckIn,
  Exercise,
  FeelingLevel,
  IntensityLevel,
  SessionWithSets,
  WeeklyPlanDay,
  WorkoutPlanWithSets,
} from "./types";

export async function getWeeklyPlan(
  supabase: SupabaseClient,
): Promise<WeeklyPlanDay[]> {
  const { data, error } = await supabase
    .from("weekly_plans")
    .select("*")
    .order("day_of_week", { ascending: true });
  if (error) throw error;
  return data as WeeklyPlanDay[];
}

export async function setPlanDay(
  supabase: SupabaseClient,
  userId: string,
  dayOfWeek: number,
  intensity: IntensityLevel,
): Promise<void> {
  const { error } = await supabase
    .from("weekly_plans")
    .update({ default_intensity: intensity })
    .eq("user_id", userId)
    .eq("day_of_week", dayOfWeek);
  if (error) throw error;
}

export async function getCheckInByDate(
  supabase: SupabaseClient,
  dateISO: string,
): Promise<CheckIn | null> {
  const { data, error } = await supabase
    .from("check_ins")
    .select("*")
    .eq("date", dateISO)
    .maybeSingle();
  if (error) throw error;
  return data as CheckIn | null;
}

export async function getCheckInsInRange(
  supabase: SupabaseClient,
  startISO: string,
  endISO: string,
): Promise<CheckIn[]> {
  const { data, error } = await supabase
    .from("check_ins")
    .select("*")
    .gte("date", startISO)
    .lte("date", endISO);
  if (error) throw error;
  return data as CheckIn[];
}

export async function upsertCheckIn(
  supabase: SupabaseClient,
  userId: string,
  payload: {
    date: string;
    feeling: FeelingLevel;
    planned_intensity: IntensityLevel;
    suggested_intensity: IntensityLevel;
    chosen_intensity: IntensityLevel;
  },
): Promise<CheckIn> {
  const { data, error } = await supabase
    .from("check_ins")
    .upsert({ user_id: userId, ...payload }, { onConflict: "user_id,date" })
    .select("*")
    .single();
  if (error) throw error;
  return data as CheckIn;
}

export async function getExercises(
  supabase: SupabaseClient,
): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as Exercise[];
}

export async function createCustomExercise(
  supabase: SupabaseClient,
  userId: string,
  payload: { name: string; category: Exercise["category"] },
): Promise<Exercise> {
  const { data, error } = await supabase
    .from("exercises")
    .insert({ owner_id: userId, is_custom: true, sort_order: 999, ...payload })
    .select("*")
    .single();
  if (error) throw error;
  return data as Exercise;
}

export interface DraftSet {
  exercise_id: string;
  order_index: number;
  reps: number | null;
  duration_seconds: number | null;
  rpe: number | null;
  notes: string | null;
}

export async function createSession(
  supabase: SupabaseClient,
  payload: {
    date: string;
    intensity: IntensityLevel;
    check_in_id: string | null;
    notes: string | null;
    sets: DraftSet[];
  },
): Promise<string> {
  const { data, error } = await supabase.rpc("create_session", {
    p_date: payload.date,
    p_intensity: payload.intensity,
    p_check_in_id: payload.check_in_id,
    p_notes: payload.notes,
    p_sets: payload.sets,
  });
  if (error) throw error;
  return data as string;
}

export async function getRecentSessions(
  supabase: SupabaseClient,
  limit = 30,
): Promise<SessionWithSets[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*, set_logs(*, exercise:exercises(*))")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as unknown as SessionWithSets[];
}

export async function getSession(
  supabase: SupabaseClient,
  id: string,
): Promise<SessionWithSets | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*, set_logs(*, exercise:exercises(*))")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as SessionWithSets | null;
}

export async function deleteSession(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("sessions").delete().eq("id", id);
  if (error) throw error;
}

export interface ExerciseHistoryPoint {
  date: string;
  best_reps: number | null;
  best_duration_seconds: number | null;
}

export async function getExerciseHistory(
  supabase: SupabaseClient,
  exerciseId: string,
): Promise<ExerciseHistoryPoint[]> {
  const { data, error } = await supabase
    .from("set_logs")
    .select("reps, duration_seconds, session:sessions!inner(date)")
    .eq("exercise_id", exerciseId)
    .order("date", { ascending: true, referencedTable: "sessions" });
  if (error) throw error;

  const rows = data as unknown as {
    reps: number | null;
    duration_seconds: number | null;
    session: { date: string };
  }[];

  const byDate = new Map<string, ExerciseHistoryPoint>();
  for (const row of rows) {
    const existing = byDate.get(row.session.date);
    const best_reps = Math.max(existing?.best_reps ?? 0, row.reps ?? 0) || null;
    const best_duration_seconds =
      Math.max(existing?.best_duration_seconds ?? 0, row.duration_seconds ?? 0) ||
      null;
    byDate.set(row.session.date, {
      date: row.session.date,
      best_reps,
      best_duration_seconds,
    });
  }

  return Array.from(byDate.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

export async function getWorkoutPlans(
  supabase: SupabaseClient,
): Promise<WorkoutPlanWithSets[]> {
  const { data, error } = await supabase
    .from("workout_plans")
    .select("*, plan_sets:workout_plan_sets(*, exercise:exercises(*))")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as WorkoutPlanWithSets[];
}

export async function getWorkoutPlan(
  supabase: SupabaseClient,
  id: string,
): Promise<WorkoutPlanWithSets | null> {
  const { data, error } = await supabase
    .from("workout_plans")
    .select("*, plan_sets:workout_plan_sets(*, exercise:exercises(*))")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as WorkoutPlanWithSets | null;
}

export async function createWorkoutPlan(
  supabase: SupabaseClient,
  payload: { name: string; sets: DraftSet[] },
): Promise<string> {
  const { data, error } = await supabase.rpc("create_workout_plan", {
    p_name: payload.name,
    p_sets: payload.sets,
  });
  if (error) throw error;
  return data as string;
}

export async function updateWorkoutPlan(
  supabase: SupabaseClient,
  id: string,
  payload: { name: string; sets: DraftSet[] },
): Promise<void> {
  const { error } = await supabase.rpc("update_workout_plan", {
    p_plan_id: id,
    p_name: payload.name,
    p_sets: payload.sets,
  });
  if (error) throw error;
}

export async function deleteWorkoutPlan(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("workout_plans").delete().eq("id", id);
  if (error) throw error;
}
