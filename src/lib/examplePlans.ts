export interface ExamplePlanExerciseSpec {
  exerciseName: string;
  sets: number;
  reps?: number;
  seconds?: number;
}

export interface ExamplePlan {
  key: string;
  name: string;
  blurb: string;
  intensityNote: string;
  exercises: ExamplePlanExerciseSpec[];
}

export const EXAMPLE_PLANS: ExamplePlan[] = [
  {
    key: "planche",
    name: "Planche Day",
    blurb:
      "Planche negatives as the main skill work, backed by protraction, push, and lean strength.",
    intensityNote:
      "The negatives are your main skill work for the day — run them as your Max or Submax effort. Protraction dips, handstand push-ups, and the planche lean stay at a moderate, technical effort rather than to failure.",
    exercises: [
      { exerciseName: "Planche Negatives", sets: 4, reps: 3 },
      { exerciseName: "Protraction Dips", sets: 2, reps: 8 },
      { exerciseName: "Handstand Push-up", sets: 2, reps: 5 },
      { exerciseName: "Planche Lean", sets: 2, seconds: 20 },
    ],
  },
  {
    key: "front_lever",
    name: "Front Lever Day",
    blurb:
      "Front lever negatives as the main skill work, backed by front lever pulls and pull-ups.",
    intensityNote:
      "The negatives are your main skill work for the day — run them as your Max or Submax effort. Front lever pulls and pull-ups stay at a moderate, technical effort rather than to failure.",
    exercises: [
      { exerciseName: "Front Lever Negatives", sets: 4, reps: 3 },
      { exerciseName: "Front Lever Pulls", sets: 2, reps: 5 },
      { exerciseName: "Pull-up", sets: 2, reps: 8 },
    ],
  },
  {
    key: "handstand",
    name: "Handstand Day",
    blurb:
      "A coordination skill, not a strength one — trained little and often, well under max effort.",
    intensityNote:
      "Handstands respond to frequency more than intensity: this is a good one to repeat most days of the week, with every set kept well under max effort — stop before form breaks down, not after.",
    exercises: [
      { exerciseName: "Wrist Mobility Routine", sets: 1, seconds: 180 },
      { exerciseName: "Wall Handstand Hold", sets: 5, seconds: 30 },
      { exerciseName: "Handstand Push-up", sets: 3, reps: 5 },
    ],
  },
];
