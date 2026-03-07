export interface BodyStats {
  age: number;
  gender: "male" | "female" | "other";
  heightCm: number;
  weightKg: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  bodyFatPercent?: number;
  muscleMassKg?: number;
  waistCm?: number;
  hipCm?: number;
}

export interface WeightGoal {
  currentWeightKg: number;
  targetWeightKg: number;
  weeklyGoalKg: number; // e.g. 0.5 kg/week loss
  targetDate?: string;
}

export interface BiometricEntry {
  id: string;
  date: string; // ISO date string
  weightKg: number;
  bodyFatPercent?: number;
  muscleMassKg?: number;
  waistCm?: number;
  hipCm?: number;
  notes?: string;
}

export interface NutritionEntry {
  id: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface DailyTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface MealPlanDay {
  day: string;
  meals: {
    type: "breakfast" | "lunch" | "dinner" | "snack";
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    description?: string;
  }[];
}

export interface MealPlan {
  id: string;
  name: string;
  createdAt: string;
  days: MealPlanDay[];
  dailyCalories: number;
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function calculateTDEE(stats: BodyStats): number {
  // Mifflin-St Jeor
  let bmr: number;
  if (stats.gender === "male") {
    bmr = 10 * stats.weightKg + 6.25 * stats.heightCm - 5 * stats.age + 5;
  } else {
    bmr = 10 * stats.weightKg + 6.25 * stats.heightCm - 5 * stats.age - 161;
  }
  const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  return Math.round(bmr * multipliers[stats.activityLevel]);
}

export function calculateDailyTargets(tdee: number, goal: WeightGoal): DailyTargets {
  // Deficit: 1 kg fat ≈ 7700 kcal
  const weeklyDeficit = goal.weeklyGoalKg * 7700;
  const dailyDeficit = weeklyDeficit / 7;
  const targetCalories = Math.max(1200, Math.round(tdee - dailyDeficit));
  
  // Macro split: 30% protein, 40% carbs, 30% fat
  const protein = Math.round((targetCalories * 0.3) / 4);
  const carbs = Math.round((targetCalories * 0.4) / 4);
  const fat = Math.round((targetCalories * 0.3) / 9);
  
  return { calories: targetCalories, protein, carbs, fat, fiber: 25 };
}
