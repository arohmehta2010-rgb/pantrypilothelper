import { useState, useCallback } from "react";
import type { WorkoutPlan, SavedPlan } from "@/lib/workoutTypes";

const STORAGE_KEY = "fitforge-saved-plans";

function loadPlans(): SavedPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useSavedPlans() {
  const [plans, setPlans] = useState<SavedPlan[]>(loadPlans);

  const savePlan = useCallback((name: string, plan: WorkoutPlan) => {
    const newPlan: SavedPlan = {
      id: crypto.randomUUID(),
      name,
      plan,
      savedAt: new Date().toISOString(),
    };
    setPlans((prev) => {
      const next = [newPlan, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    return newPlan;
  }, []);

  const deletePlan = useCallback((id: string) => {
    setPlans((prev) => {
      const next = prev.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { plans, savePlan, deletePlan };
}
