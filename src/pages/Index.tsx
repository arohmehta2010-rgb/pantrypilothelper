import { useState } from "react";
import UserStatsForm from "@/components/workout/UserStatsForm";
import EquipmentSelector from "@/components/workout/EquipmentSelector";
import WorkoutPlanDisplay from "@/components/workout/WorkoutPlanDisplay";
import type { UserStats, WorkoutPlan, EquipmentSelection } from "@/lib/workoutTypes";
import { EQUIPMENT_LIST, SPLIT_OPTIONS } from "@/lib/workoutTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dumbbell, Loader2 } from "lucide-react";

type Step = "stats" | "equipment" | "loading" | "plan";

const Index = () => {
  const [step, setStep] = useState<Step>("stats");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);

  const handleStatsSubmit = (s: UserStats) => {
    setStats(s);
    setStep("equipment");
  };

  const handleEquipmentSubmit = async (selections: EquipmentSelection[]) => {
    if (!stats) return;
    setStep("loading");

    const equipmentDescriptions = selections.map((sel) => {
      const eq = EQUIPMENT_LIST.find((e) => e.id === sel.id);
      if (!eq) return null;
      if (sel.maxWeight) return `${eq.name} (up to ${sel.maxWeight} lbs)`;
      return eq.name;
    }).filter(Boolean);

    const selectedSplit = SPLIT_OPTIONS.find((s) => s.id === stats.split);
    const daysPerWeek = stats.split === "custom" ? 4 : (selectedSplit?.days ?? 4);

    try {
      const { data, error } = await supabase.functions.invoke("generate-workout", {
        body: {
          stats: { ...stats, daysPerWeek },
          equipment: equipmentDescriptions,
          customDayFocuses: stats.customDayFocuses,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setPlan(data as WorkoutPlan);
      setStep("plan");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate workout plan. Please try again.");
      setStep("equipment");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4">
          <button
            onClick={() => { setStep("stats"); setPlan(null); }}
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <Dumbbell className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight">FitForge</span>
          </button>

          <div className="ml-auto flex items-center gap-2">
            {["Stats", "Equipment", "Plan"].map((label, i) => {
              const stepMap: Step[] = ["stats", "equipment", "plan"];
              const currentIdx = step === "loading" ? 2 : stepMap.indexOf(step);
              const isActive = i <= currentIdx;
              return (
                <div key={label} className="flex items-center gap-2">
                  {i > 0 && <div className={`h-px w-6 ${isActive ? "bg-primary" : "bg-border"}`} />}
                  <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <main className="px-4 py-12">
        {step === "stats" && <UserStatsForm onSubmit={handleStatsSubmit} />}

        {step === "equipment" && (
          <EquipmentSelector
            onSubmit={handleEquipmentSubmit}
            onBack={() => setStep("stats")}
          />
        )}

        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-lg font-medium text-foreground">Building your workout plan...</p>
            <p className="text-sm text-muted-foreground">This usually takes 10–20 seconds</p>
          </div>
        )}

        {step === "plan" && plan && (
          <WorkoutPlanDisplay
            plan={plan}
            onBack={() => setStep("equipment")}
            onRestart={() => { setStep("stats"); setPlan(null); }}
          />
        )}
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        FitForge — your workout, your way
      </footer>
    </div>
  );
};

export default Index;
