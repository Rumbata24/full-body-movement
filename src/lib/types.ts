export type IntensityLevel = "high" | "moderate" | "recovery";

export type FeelingLevel = "fresh" | "okay" | "tired" | "sore" | "wiped";

export type ExerciseCategory = "skill" | "strength" | "mobility" | "stretch";

export interface Profile {
  id: string;
  units: "metric" | "imperial";
  display_name: string | null;
  created_at: string;
}

export interface WeeklyPlanDay {
  id: string;
  user_id: string;
  day_of_week: number; // 0 = Sunday .. 6 = Saturday
  default_intensity: IntensityLevel;
}

export interface CheckIn {
  id: string;
  user_id: string;
  date: string;
  feeling: FeelingLevel;
  planned_intensity: IntensityLevel;
  suggested_intensity: IntensityLevel;
  chosen_intensity: IntensityLevel;
  created_at: string;
}

export interface Exercise {
  id: string;
  owner_id: string | null;
  name: string;
  category: ExerciseCategory;
  skill_group: string | null;
  progression_stage: string | null;
  is_custom: boolean;
  sort_order: number;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  date: string;
  intensity: IntensityLevel;
  check_in_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface SetLog {
  id: string;
  session_id: string;
  exercise_id: string;
  order_index: number;
  reps: number | null;
  duration_seconds: number | null;
  rpe: number | null;
  notes: string | null;
  created_at: string;
}

export interface SetLogWithExercise extends SetLog {
  exercise: Exercise;
}

export interface SessionWithSets extends Session {
  set_logs: SetLogWithExercise[];
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface WorkoutPlanSet {
  id: string;
  plan_id: string;
  exercise_id: string;
  order_index: number;
  reps: number | null;
  duration_seconds: number | null;
}

export interface WorkoutPlanSetWithExercise extends WorkoutPlanSet {
  exercise: Exercise;
}

export interface WorkoutPlanWithSets extends WorkoutPlan {
  plan_sets: WorkoutPlanSetWithExercise[];
}
