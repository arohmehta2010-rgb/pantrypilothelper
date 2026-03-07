import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, User, Target, Activity, Utensils, Calendar } from "lucide-react";
import { useFitnessStorage } from "@/hooks/useFitnessStorage";
import { useUnitSystem } from "@/hooks/useUnitSystem";
import { calculateTDEE, calculateDailyTargets } from "@/lib/fitnessTypes";
import BodyStatsForm from "@/components/fitness/BodyStatsForm";
import WeightGoalForm from "@/components/fitness/WeightGoalForm";
import BiometricTracker from "@/components/fitness/BiometricTracker";
import NutritionLogger from "@/components/fitness/NutritionLogger";
import MealPlanSection from "@/components/fitness/MealPlanSection";
import { toast } from "sonner";
import CursorSpotlight from "@/components/CursorSpotlight";

const tabs = [
  { id: "stats", label: "Body Stats", icon: User },
  { id: "goals", label: "Goals", icon: Target },
  { id: "biometrics", label: "Biometrics", icon: Activity },
  { id: "nutrition", label: "Nutrition", icon: Utensils },
  { id: "mealplan", label: "Meal Plans", icon: Calendar },
] as const;

type Tab = typeof tabs[number]["id"];

export default function Fitness() {
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("stats");
  const store = useFitnessStorage();
  const { unit, setUnit } = useUnitSystem();

  const tdee = store.bodyStats ? calculateTDEE(store.bodyStats) : null;
  const dailyTargets = tdee && store.weightGoal ? calculateDailyTargets(tdee, store.weightGoal) : null;

  return (
    <div className="relative flex min-h-screen flex-col">
      <CursorSpotlight />
      <div className="relative z-10 flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <button onClick={() => nav("/")} className="flex items-center gap-2 text-xl font-display font-semibold text-foreground tracking-tight hover:text-primary transition">
          <ChefHat className="w-6 h-6 text-primary" /> PantryPilot
        </button>
        <div className="flex gap-1">
          <button onClick={() => nav("/")} className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:bg-muted">Home</button>
          <button className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground">Fitness</button>
        </div>
      </nav>

      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <header className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight text-foreground">
              Fitness <span className="text-primary">Tracker</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Track your body stats, set goals, log nutrition, and generate personalized meal plans.
            </p>
          </header>

          {/* Unit toggle */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-lg border border-border bg-secondary p-0.5">
              <button
                onClick={() => setUnit("metric")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  unit === "metric" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Metric (kg, cm)
              </button>
              <button
                onClick={() => setUnit("imperial")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  unit === "imperial" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Imperial (lbs, ft)
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            {tab === "stats" && (
              <BodyStatsForm initial={store.bodyStats} onSave={s => { store.setBodyStats(s); toast.success("Body stats saved!"); }} unit={unit} />
            )}
            {tab === "goals" && (
              <WeightGoalForm bodyStats={store.bodyStats} initial={store.weightGoal} onSave={g => { store.setWeightGoal(g); toast.success("Weight goal set!"); }} unit={unit} />
            )}
            {tab === "biometrics" && (
              <BiometricTracker entries={store.biometrics} onAdd={e => { store.addBiometric(e); toast.success("Entry logged!"); }} unit={unit} />
            )}
            {tab === "nutrition" && (
              <NutritionLogger entries={store.nutritionLog} targets={dailyTargets} onAdd={e => { store.addNutrition(e); toast.success("Meal logged!"); }} onRemove={store.removeNutrition} />
            )}
            {tab === "mealplan" && (
              <MealPlanSection bodyStats={store.bodyStats} weightGoal={store.weightGoal} dailyTargets={dailyTargets} mealPlans={store.mealPlans} onAddPlan={store.addMealPlan} />
            )}
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        PantryPilot — simple / fast / healthy
      </footer>
      </div>
    </div>
  );
}
