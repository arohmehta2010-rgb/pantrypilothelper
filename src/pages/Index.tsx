import { useState } from "react";
import UserStatsForm from "@/components/workout/UserStatsForm";
import EquipmentSelector from "@/components/workout/EquipmentSelector";
import WorkoutPlanDisplay from "@/components/workout/WorkoutPlanDisplay";
import type { UserStats, WorkoutPlan, EquipmentSelection, SavedPlan } from "@/lib/workoutTypes";
import { EQUIPMENT_LIST, SPLIT_OPTIONS } from "@/lib/workoutTypes";
import { useSavedPlans } from "@/hooks/useSavedPlans";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dumbbell, Loader2, BookOpen, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

type Step = "stats" | "equipment" | "loading" | "plan" | "saved-plans" | "view-saved";

const Index = () => {
  const [step, setStep] = useState<Step>("stats");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [viewingSavedPlan, setViewingSavedPlan] = useState<SavedPlan | null>(null);
  const { plans: savedPlans, savePlan, deletePlan } = useSavedPlans();

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

  const handleSavePlan = (name: string) => {
    if (!plan) return;
    savePlan(name, plan);
    toast.success("Workout plan saved!");
  };

  const handleViewSaved = (saved: SavedPlan) => {
    setViewingSavedPlan(saved);
    setStep("view-saved");
  };

  const handleDeleteSaved = (id: string) => {
    deletePlan(id);
    toast.success("Plan deleted");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4">
          <button
            onClick={() => { setStep("stats"); setPlan(null); setViewingSavedPlan(null); }}
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <Dumbbell className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight">FitForge</span>
          </button>

          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={() => setStep("saved-plans")}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                step === "saved-plans" || step === "view-saved"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Saved Plans
              {savedPlans.length > 0 && (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                  {savedPlans.length}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2">
              {["Stats", "Equipment", "Plan"].map((label, i) => {
                const stepMap: Step[] = ["stats", "equipment", "plan"];
                const currentIdx = step === "loading" ? 2 : stepMap.indexOf(step);
                const isActive = i <= currentIdx && step !== "saved-plans" && step !== "view-saved";
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
            onSave={handleSavePlan}
          />
        )}

        {step === "view-saved" && viewingSavedPlan && (
          <WorkoutPlanDisplay
            plan={viewingSavedPlan.plan}
            onBack={() => setStep("saved-plans")}
            onRestart={() => { setStep("stats"); setPlan(null); setViewingSavedPlan(null); }}
          />
        )}

        {step === "saved-plans" && (
          <div className="mx-auto max-w-lg space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Saved Plans</h1>
              <p className="mt-2 text-muted-foreground">Your previously saved workout plans</p>
            </div>

            {savedPlans.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">No saved plans yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setStep("stats")}
                >
                  Create Your First Plan
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedPlans.map((saved) => (
                  <div
                    key={saved.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
                  >
                    <button
                      onClick={() => handleViewSaved(saved)}
                      className="flex-1 text-left"
                    >
                      <h3 className="font-semibold text-foreground">{saved.name}</h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(saved.savedAt).toLocaleDateString()}
                        <span>·</span>
                        <span>{saved.plan.days.length} days</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteSaved(saved.id)}
                      className="rounded-lg p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        FitForge — your workout, your way
      </footer>
    </div>
  );
};

export default Index;
