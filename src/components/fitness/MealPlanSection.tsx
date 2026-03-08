import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { BodyStats, WeightGoal, DailyTargets, MealPlan, MealPlanDay } from "@/lib/fitnessTypes";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Calendar, Utensils } from "lucide-react";

// Template meal plans
const TEMPLATES: MealPlan[] = [
  {
    id: "template-1500", name: "1500 kcal Plan", createdAt: "", dailyCalories: 1500,
    days: Array.from({ length: 7 }, (_, i) => ({
      day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i],
      meals: [
        { type: "breakfast" as const, name: "Greek yogurt with berries & granola", calories: 300, protein: 20, carbs: 35, fat: 10 },
        { type: "lunch" as const, name: "Grilled chicken salad with vinaigrette", calories: 450, protein: 35, carbs: 20, fat: 22 },
        { type: "dinner" as const, name: "Baked salmon with roasted vegetables", calories: 500, protein: 35, carbs: 30, fat: 20 },
        { type: "snack" as const, name: "Apple with almond butter", calories: 250, protein: 6, carbs: 25, fat: 15 },
      ],
    })),
  },
  {
    id: "template-1800", name: "1800 kcal Plan", createdAt: "", dailyCalories: 1800,
    days: Array.from({ length: 7 }, (_, i) => ({
      day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i],
      meals: [
        { type: "breakfast" as const, name: "Oatmeal with banana, chia seeds & honey", calories: 400, protein: 12, carbs: 55, fat: 14 },
        { type: "lunch" as const, name: "Turkey & avocado wrap with side salad", calories: 550, protein: 30, carbs: 40, fat: 25 },
        { type: "dinner" as const, name: "Lean beef stir-fry with brown rice", calories: 600, protein: 35, carbs: 55, fat: 18 },
        { type: "snack" as const, name: "Protein smoothie with spinach", calories: 250, protein: 20, carbs: 25, fat: 5 },
      ],
    })),
  },
];

interface Props {
  bodyStats: BodyStats | null;
  weightGoal: WeightGoal | null;
  dailyTargets: DailyTargets | null;
  mealPlans: MealPlan[];
  onAddPlan: (p: MealPlan) => void;
}

export default function MealPlanSection({ bodyStats, weightGoal, dailyTargets, mealPlans, onAddPlan }: Props) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const generateAIPlan = async () => {
    if (!bodyStats || !weightGoal || !dailyTargets) {
      toast.error("Please fill in your body stats and weight goal first.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: { bodyStats, weightGoal, dailyTargets, days: 7 },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      
      const plan: MealPlan = {
        id: crypto.randomUUID(),
        name: data.mealPlan.name || "Generated Meal Plan",
        createdAt: new Date().toISOString(),
        days: data.mealPlan.days,
        dailyCalories: dailyTargets.calories,
      };
      onAddPlan(plan);
      setExpanded(plan.id);
      toast.success("Meal plan generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate meal plan.");
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = (template: MealPlan) => {
    const plan: MealPlan = { ...template, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    onAddPlan(plan);
    setExpanded(plan.id);
    toast.success(`${template.name} added!`);
  };

  const allPlans = [...mealPlans];

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Button onClick={generateAIPlan} disabled={loading || !bodyStats || !weightGoal} className="w-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Generate Plan
        </Button>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center">Or use a template:</p>
          <div className="flex gap-2">
            {TEMPLATES.map(t => (
              <Button key={t.id} variant="outline" size="sm" onClick={() => useTemplate(t)} className="flex-1 text-xs">
                {t.dailyCalories} kcal
              </Button>
            ))}
          </div>
        </div>
      </div>

      {!bodyStats && (
        <p className="text-xs text-muted-foreground text-center">Fill in your body stats and set a weight goal to generate a meal plan.</p>
      )}

      {/* Plans list */}
      {allPlans.map(plan => (
        <div key={plan.id} className="rounded-xl border border-border bg-card overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === plan.id ? null : plan.id)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-secondary/50 transition"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">{plan.name}</span>
              <span className="text-[10px] text-muted-foreground">{plan.dailyCalories} kcal/day</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : "Template"}
            </span>
          </button>

          {expanded === plan.id && (
            <div className="px-4 pb-4 space-y-3">
              {plan.days.map((day, di) => (
                <div key={di} className="space-y-1.5">
                  <p className="text-xs font-semibold text-primary">{day.day}</p>
                  {day.meals.map((meal, mi) => (
                    <div key={mi} className="flex items-center justify-between bg-secondary rounded-lg px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <Utensils className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">{meal.name}</span>
                        <span className="text-[10px] text-muted-foreground capitalize bg-muted px-1.5 py-0.5 rounded">{meal.type}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{meal.calories} kcal</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
