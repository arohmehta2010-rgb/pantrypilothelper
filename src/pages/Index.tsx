import { useState } from "react";
import UserStatsForm from "@/components/workout/UserStatsForm";
import EquipmentSelector from "@/components/workout/EquipmentSelector";
import WorkoutPlanDisplay from "@/components/workout/WorkoutPlanDisplay";
import type { UserStats, WorkoutPlan, EquipmentSelection, SavedPlan } from "@/lib/workoutTypes";
import { EQUIPMENT_LIST, SPLIT_OPTIONS } from "@/lib/workoutTypes";
import { useSavedPlans } from "@/hooks/useSavedPlans";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dumbbell, Loader2, BookOpen, Trash2, Clock, Zap } from "lucide-react";
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
    const daysPerWeek = stats.split === "custom"
      ? (stats.customDayFocuses?.length ?? 4)
      : (selectedSplit?.days ?? 4);

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

  const stepIndex = step === "stats" ? 0 : step === "equipment" ? 1 : step === "loading" || step === "plan" ? 2 : -1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-6">
          <button
            onClick={() => { setStep("stats"); setPlan(null); setViewingSavedPlan(null); }}
            className="flex items-center gap-2.5 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 glow-primary">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-200">
              FitForge
            </span>
          </button>

          <div className="ml-auto flex items-center gap-5">
            <button
              onClick={() => setStep("saved-plans")}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
                step === "saved-plans" || step === "view-saved"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Saved</span>
              {savedPlans.length > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-[10px] font-bold text-primary">
                  {savedPlans.length}
                </span>
              )}
            </button>

            {/* Step indicators */}
            <div className="hidden sm:flex items-center gap-1">
              {["Stats", "Equipment", "Plan"].map((label, i) => (
                <div key={label} className="flex items-center">
                  {i > 0 && (
                    <div className={`h-px w-5 mx-1 transition-colors duration-300 ${i <= stepIndex ? "bg-primary/60" : "bg-border"}`} />
                  )}
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-300 ${
                      i === stepIndex
                        ? "bg-primary/15 text-primary"
                        : i < stepIndex
                        ? "text-primary/60"
                        : "text-muted-foreground/60"
                    }`}
                  >
                    <div className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                      i <= stepIndex ? "bg-primary" : "bg-muted-foreground/30"
                    }`} />
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 sm:py-10">
        {step === "stats" && <UserStatsForm onSubmit={handleStatsSubmit} />}

        {step === "equipment" && (
          <EquipmentSelector
            onSubmit={handleEquipmentSubmit}
            onBack={() => setStep("stats")}
          />
        )}

        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-32 gap-5">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-2 border-primary/20" />
              <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-transparent border-t-primary animate-spin" />
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-lg font-semibold text-foreground">Building your plan</p>
              <p className="text-sm text-muted-foreground">Usually takes 10–20 seconds</p>
            </div>
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
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Saved Plans</h1>
              <p className="text-sm text-muted-foreground">Your previously saved workout plans</p>
            </div>

            {savedPlans.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">No saved plans yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setStep("stats")}
                >
                  Create Your First Plan
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {savedPlans.map((saved) => (
                  <div
                    key={saved.id}
                    className="glass-card flex items-center gap-3 rounded-xl p-4 hover:border-primary/30 transition-all duration-200 group"
                  >
                    <button
                      onClick={() => handleViewSaved(saved)}
                      className="flex-1 text-left"
                    >
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200">{saved.name}</h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(saved.savedAt).toLocaleDateString()}
                        <span className="text-border">·</span>
                        <span>{saved.plan.days.length} days</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteSaved(saved.id)}
                      className="rounded-lg p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
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

      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground/60">
        FitForge — your workout, your way
      </footer>
    </div>
  );
};

export default Index;
