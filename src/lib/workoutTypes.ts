export interface UserStats {
  gender: "male" | "female" | "other";
  age: number;
  weight: number;
  weightUnit: "kg" | "lbs";
  height: number;
  heightUnit: "cm" | "ft";
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  goal: "lose-weight" | "build-muscle" | "stay-fit" | "increase-strength" | "improve-endurance";
  split: WorkoutSplit;
  customDayFocuses?: DayFocus[];
}

export type WorkoutSplit =
  | "full-body"
  | "upper-lower"
  | "push-pull-legs"
  | "bro-split"
  | "custom";

export type DayFocus =
  | "push"
  | "pull"
  | "legs"
  | "upper"
  | "lower"
  | "full-body"
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "core"
  | "cardio"
  | "rest";

export const DAY_FOCUS_OPTIONS: { id: DayFocus; label: string; emoji: string }[] = [
  { id: "push", label: "Push", emoji: "💥" },
  { id: "pull", label: "Pull", emoji: "🪝" },
  { id: "legs", label: "Legs", emoji: "🦵" },
  { id: "upper", label: "Upper Body", emoji: "💪" },
  { id: "lower", label: "Lower Body", emoji: "🏋️" },
  { id: "full-body", label: "Full Body", emoji: "🧍" },
  { id: "chest", label: "Chest", emoji: "🫁" },
  { id: "back", label: "Back", emoji: "🔙" },
  { id: "shoulders", label: "Shoulders", emoji: "🔝" },
  { id: "arms", label: "Arms", emoji: "💪" },
  { id: "core", label: "Core", emoji: "🎯" },
  { id: "cardio", label: "Cardio", emoji: "🏃" },
  { id: "rest", label: "Rest", emoji: "😴" },
];

export interface SplitOption {
  id: WorkoutSplit;
  name: string;
  days: number;
  description: string;
}

export const SPLIT_OPTIONS: SplitOption[] = [
  { id: "full-body", name: "Full Body", days: 3, description: "3 days — hit every muscle group each session" },
  { id: "upper-lower", name: "Upper / Lower", days: 4, description: "4 days — alternate upper and lower body" },
  { id: "push-pull-legs", name: "Push / Pull / Legs", days: 6, description: "6 days — group by movement pattern" },
  { id: "bro-split", name: "Body Part Split", days: 5, description: "5 days — one muscle group per day" },
  { id: "custom", name: "Custom", days: 0, description: "Choose your own days & focus areas" },
];

export interface SplitPreset {
  name: string;
  days: DayFocus[];
}

export const SPLIT_PRESETS: SplitPreset[] = [
  { name: "PPL (3-Day)", days: ["push", "pull", "legs"] },
  { name: "Upper / Lower (2-Day)", days: ["upper", "lower"] },
  { name: "Upper / Lower (4-Day)", days: ["upper", "lower", "upper", "lower"] },
  { name: "PPL × 2 (6-Day)", days: ["push", "pull", "legs", "push", "pull", "legs"] },
  { name: "Full Body (2-Day)", days: ["full-body", "full-body"] },
  { name: "Full Body (4-Day)", days: ["full-body", "full-body", "full-body", "full-body"] },
  { name: "Arnold Split (6-Day)", days: ["chest", "back", "legs", "chest", "back", "legs"] },
  { name: "Chest/Back/Legs/Shoulders/Arms", days: ["chest", "back", "legs", "shoulders", "arms"] },
  { name: "Push/Pull/Legs/Upper/Lower", days: ["push", "pull", "legs", "upper", "lower"] },
];

export interface SavedPlan {
  id: string;
  name: string;
  plan: WorkoutPlan;
  savedAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  icon: string;
  category: "free-weights" | "machines" | "bodyweight" | "cardio" | "accessories" | "plates-bars";
  hasWeight?: boolean;
  weightOptions?: number[]; // available weights in lbs
}

export const EQUIPMENT_LIST: Equipment[] = [
  // Free Weights
  { id: "dumbbells", name: "Dumbbells", icon: "💪", category: "free-weights", hasWeight: true, weightOptions: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100] },
  { id: "barbell", name: "Barbell", icon: "🏋️", category: "free-weights", hasWeight: true, weightOptions: [45, 65, 85, 95, 115, 135, 155, 185, 205, 225, 275, 315, 365, 405] },
  { id: "kettlebell", name: "Kettlebell", icon: "🔔", category: "free-weights", hasWeight: true, weightOptions: [10, 15, 20, 25, 30, 35, 40, 45, 50, 53, 62, 70, 80, 90, 100] },
  { id: "ez-curl-bar", name: "EZ Curl Bar", icon: "🔧", category: "free-weights", hasWeight: true, weightOptions: [25, 35, 45, 55, 65, 75, 85, 95] },
  { id: "bench", name: "Flat Bench", icon: "🪑", category: "free-weights" },
  { id: "incline-bench", name: "Incline Bench", icon: "📐", category: "free-weights" },
  { id: "decline-bench", name: "Decline Bench", icon: "⬇️", category: "free-weights" },
  { id: "squat-rack", name: "Squat Rack / Power Rack", icon: "🏗️", category: "free-weights" },
  { id: "trap-bar", name: "Trap / Hex Bar", icon: "⬡", category: "free-weights", hasWeight: true, weightOptions: [45, 65, 135, 185, 225, 275, 315, 365, 405] },
  { id: "medicine-ball", name: "Medicine Ball", icon: "⚽", category: "free-weights", hasWeight: true, weightOptions: [4, 6, 8, 10, 12, 14, 16, 20, 25, 30] },

  // Plates & Bars
  { id: "weight-plates", name: "Weight Plates", icon: "⚖️", category: "plates-bars", hasWeight: true, weightOptions: [2.5, 5, 10, 25, 35, 45] },
  { id: "landmine", name: "Landmine Attachment", icon: "📍", category: "plates-bars" },

  // Machines
  { id: "cable-machine", name: "Cable Machine", icon: "⚙️", category: "machines" },
  { id: "smith-machine", name: "Smith Machine", icon: "🏗️", category: "machines" },
  { id: "leg-press", name: "Leg Press", icon: "🦵", category: "machines" },
  { id: "leg-curl", name: "Leg Curl Machine", icon: "🦿", category: "machines" },
  { id: "leg-extension", name: "Leg Extension Machine", icon: "🦶", category: "machines" },
  { id: "lat-pulldown", name: "Lat Pulldown", icon: "⬇️", category: "machines" },
  { id: "seated-row", name: "Seated Row Machine", icon: "🚣", category: "machines" },
  { id: "chest-press", name: "Chest Press Machine", icon: "🫁", category: "machines" },
  { id: "shoulder-press-machine", name: "Shoulder Press Machine", icon: "🔝", category: "machines" },
  { id: "pec-deck", name: "Pec Deck / Fly Machine", icon: "🦋", category: "machines" },
  { id: "hack-squat", name: "Hack Squat Machine", icon: "🔻", category: "machines" },
  { id: "hip-abductor", name: "Hip Abductor / Adductor", icon: "↔️", category: "machines" },
  { id: "calf-raise", name: "Calf Raise Machine", icon: "🧦", category: "machines" },
  { id: "preacher-curl", name: "Preacher Curl Bench", icon: "💈", category: "machines" },

  // Bodyweight
  { id: "bodyweight-only", name: "Bodyweight Only", icon: "🧍", category: "bodyweight" },
  { id: "pull-up-bar", name: "Pull-up Bar", icon: "🔩", category: "bodyweight" },
  { id: "dip-station", name: "Dip Station", icon: "🔽", category: "bodyweight" },
  { id: "gymnastic-rings", name: "Gymnastic Rings", icon: "⭕", category: "bodyweight" },
  { id: "parallettes", name: "Parallettes", icon: "🔀", category: "bodyweight" },
  { id: "plyo-box", name: "Plyo Box", icon: "📦", category: "bodyweight" },

  // Cardio
  { id: "treadmill", name: "Treadmill", icon: "🏃", category: "cardio" },
  { id: "stationary-bike", name: "Stationary Bike", icon: "🚴", category: "cardio" },
  { id: "rowing-machine", name: "Rowing Machine", icon: "🚣", category: "cardio" },
  { id: "elliptical", name: "Elliptical", icon: "🔄", category: "cardio" },
  { id: "stairmaster", name: "Stairmaster", icon: "🪜", category: "cardio" },
  { id: "assault-bike", name: "Assault / Air Bike", icon: "🌀", category: "cardio" },
  { id: "ski-erg", name: "Ski Erg", icon: "⛷️", category: "cardio" },
  { id: "jump-rope", name: "Jump Rope", icon: "⏭️", category: "cardio" },
  { id: "battle-ropes", name: "Battle Ropes", icon: "🪢", category: "cardio" },

  // Accessories
  { id: "resistance-bands", name: "Resistance Bands", icon: "🪢", category: "accessories" },
  { id: "trx", name: "TRX / Suspension Trainer", icon: "🪝", category: "accessories" },
  { id: "yoga-mat", name: "Yoga Mat", icon: "🧘", category: "accessories" },
  { id: "foam-roller", name: "Foam Roller", icon: "🧻", category: "accessories" },
  { id: "ab-wheel", name: "Ab Wheel", icon: "🎡", category: "accessories" },
  { id: "bosu-ball", name: "BOSU Ball", icon: "🏐", category: "accessories" },
  { id: "stability-ball", name: "Stability Ball", icon: "🎈", category: "accessories" },
  { id: "weight-belt", name: "Dip / Weight Belt", icon: "🪝", category: "accessories" },
  { id: "wrist-wraps", name: "Wrist Wraps", icon: "🩹", category: "accessories" },
  { id: "lifting-straps", name: "Lifting Straps", icon: "🎀", category: "accessories" },
  { id: "ankle-weights", name: "Ankle Weights", icon: "⚓", category: "accessories", hasWeight: true, weightOptions: [2, 3, 5, 8, 10, 15, 20] },
];

export interface EquipmentSelection {
  id: string;
  maxWeight?: number; // max weight the user has available (in lbs)
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
  formCues: string[];
  targetMuscles: string[];
  commonMistakes: string[];
  caloriesBurned?: number;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  warmup: string;
  exercises: WorkoutExercise[];
  cooldown: string;
  totalCalories?: number;
  estimatedDuration?: string;
}

export interface WorkoutPlan {
  title: string;
  summary: string;
  days: WorkoutDay[];
  tips: string[];
  weeklyCalories?: number;
}
