import { useState, useEffect, useCallback } from "react";
import type { BodyStats, WeightGoal, BiometricEntry, NutritionEntry, MealPlan } from "@/lib/fitnessTypes";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useFitnessStorage() {
  const [bodyStats, setBodyStatsState] = useState<BodyStats | null>(() => load("pp_body_stats", null));
  const [weightGoal, setWeightGoalState] = useState<WeightGoal | null>(() => load("pp_weight_goal", null));
  const [biometrics, setBiometricsState] = useState<BiometricEntry[]>(() => load("pp_biometrics", []));
  const [nutritionLog, setNutritionLogState] = useState<NutritionEntry[]>(() => load("pp_nutrition", []));
  const [mealPlans, setMealPlansState] = useState<MealPlan[]>(() => load("pp_meal_plans", []));

  const setBodyStats = useCallback((s: BodyStats) => { setBodyStatsState(s); save("pp_body_stats", s); }, []);
  const setWeightGoal = useCallback((g: WeightGoal) => { setWeightGoalState(g); save("pp_weight_goal", g); }, []);
  
  const addBiometric = useCallback((entry: BiometricEntry) => {
    setBiometricsState(prev => { const next = [entry, ...prev]; save("pp_biometrics", next); return next; });
  }, []);

  const addNutrition = useCallback((entry: NutritionEntry) => {
    setNutritionLogState(prev => { const next = [entry, ...prev]; save("pp_nutrition", next); return next; });
  }, []);

  const removeNutrition = useCallback((id: string) => {
    setNutritionLogState(prev => { const next = prev.filter(e => e.id !== id); save("pp_nutrition", next); return next; });
  }, []);

  const addMealPlan = useCallback((plan: MealPlan) => {
    setMealPlansState(prev => { const next = [plan, ...prev]; save("pp_meal_plans", next); return next; });
  }, []);

  return {
    bodyStats, setBodyStats,
    weightGoal, setWeightGoal,
    biometrics, addBiometric,
    nutritionLog, addNutrition, removeNutrition,
    mealPlans, addMealPlan,
  };
}
