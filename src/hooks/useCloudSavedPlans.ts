import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { WorkoutPlan } from "@/lib/workoutTypes";

export interface CloudSavedPlan {
  id: string;
  name: string;
  plan: WorkoutPlan;
  created_at: string;
}

export function useCloudSavedPlans(userId: string | undefined) {
  const [plans, setPlans] = useState<CloudSavedPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlans = useCallback(async () => {
    if (!userId) { setPlans([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("saved_workout_plans")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPlans(data.map((d: any) => ({
        id: d.id,
        name: d.name,
        plan: d.plan as WorkoutPlan,
        created_at: d.created_at,
      })));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const savePlan = async (name: string, plan: WorkoutPlan) => {
    if (!userId) return;
    const { error } = await supabase
      .from("saved_workout_plans")
      .insert({ user_id: userId, name, plan: plan as any });
    if (!error) await fetchPlans();
    return error;
  };

  const deletePlan = async (id: string) => {
    const { error } = await supabase
      .from("saved_workout_plans")
      .delete()
      .eq("id", id);
    if (!error) setPlans((p) => p.filter((x) => x.id !== id));
    return error;
  };

  return { plans, loading, savePlan, deletePlan, refetch: fetchPlans };
}
