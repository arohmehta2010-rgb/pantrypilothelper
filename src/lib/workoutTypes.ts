export interface UserStats {
  gender: "male" | "female" | "other";
  age: number;
  weight: number;
  weightUnit: "kg" | "lbs";
  height: number;
  heightUnit: "cm" | "ft";
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  goal: "lose-weight" | "build-muscle" | "stay-fit" | "increase-strength" | "improve-endurance";
  daysPerWeek: number;
}

export interface Equipment {
  id: string;
  name: string;
  icon: string;
  category: "free-weights" | "machines" | "bodyweight" | "cardio" | "accessories";
}

export const EQUIPMENT_LIST: Equipment[] = [
  { id: "barbell", name: "Barbell", icon: "🏋️", category: "free-weights" },
  { id: "dumbbells", name: "Dumbbells", icon: "💪", category: "free-weights" },
  { id: "kettlebell", name: "Kettlebell", icon: "🔔", category: "free-weights" },
  { id: "pull-up-bar", name: "Pull-up Bar", icon: "🔩", category: "bodyweight" },
  { id: "resistance-bands", name: "Resistance Bands", icon: "🪢", category: "accessories" },
  { id: "bench", name: "Flat/Incline Bench", icon: "🪑", category: "free-weights" },
  { id: "cable-machine", name: "Cable Machine", icon: "⚙️", category: "machines" },
  { id: "smith-machine", name: "Smith Machine", icon: "🏗️", category: "machines" },
  { id: "leg-press", name: "Leg Press", icon: "🦵", category: "machines" },
  { id: "treadmill", name: "Treadmill", icon: "🏃", category: "cardio" },
  { id: "stationary-bike", name: "Stationary Bike", icon: "🚴", category: "cardio" },
  { id: "rowing-machine", name: "Rowing Machine", icon: "🚣", category: "cardio" },
  { id: "jump-rope", name: "Jump Rope", icon: "⏭️", category: "cardio" },
  { id: "yoga-mat", name: "Yoga Mat", icon: "🧘", category: "accessories" },
  { id: "foam-roller", name: "Foam Roller", icon: "🧻", category: "accessories" },
  { id: "ez-curl-bar", name: "EZ Curl Bar", icon: "🔧", category: "free-weights" },
  { id: "dip-station", name: "Dip Station", icon: "🔽", category: "bodyweight" },
  { id: "ab-wheel", name: "Ab Wheel", icon: "🎡", category: "accessories" },
  { id: "bodyweight-only", name: "Bodyweight Only", icon: "🧍", category: "bodyweight" },
  { id: "trx", name: "TRX / Suspension", icon: "🪝", category: "accessories" },
];

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  warmup: string;
  exercises: WorkoutExercise[];
  cooldown: string;
}

export interface WorkoutPlan {
  title: string;
  summary: string;
  days: WorkoutDay[];
  tips: string[];
}
