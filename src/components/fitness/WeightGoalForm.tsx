import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WeightGoal, BodyStats, DailyTargets } from "@/lib/fitnessTypes";
import { calculateTDEE, calculateDailyTargets } from "@/lib/fitnessTypes";
import { Target, TrendingDown } from "lucide-react";

interface Props {
  bodyStats: BodyStats | null;
  initial: WeightGoal | null;
  onSave: (g: WeightGoal) => void;
}

export default function WeightGoalForm({ bodyStats, initial, onSave }: Props) {
  const [form, setForm] = useState<WeightGoal>(initial ?? {
    currentWeightKg: bodyStats?.weightKg ?? 80,
    targetWeightKg: bodyStats ? bodyStats.weightKg - 10 : 70,
    weeklyGoalKg: 0.5,
  });

  const tdee = bodyStats ? calculateTDEE(bodyStats) : 2000;
  const targets: DailyTargets = calculateDailyTargets(tdee, form);
  const weeksToGoal = form.weeklyGoalKg > 0 ? Math.ceil((form.currentWeightKg - form.targetWeightKg) / form.weeklyGoalKg) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Current Weight (kg)</Label>
          <Input type="number" value={form.currentWeightKg} onChange={e => setForm(p => ({ ...p, currentWeightKg: +e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Target Weight (kg)</Label>
          <Input type="number" value={form.targetWeightKg} onChange={e => setForm(p => ({ ...p, targetWeightKg: +e.target.value }))} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Weekly Weight Loss Goal</Label>
        <Select value={String(form.weeklyGoalKg)} onValueChange={v => setForm(p => ({ ...p, weeklyGoalKg: +v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0.25">0.25 kg/week (slow & steady)</SelectItem>
            <SelectItem value="0.5">0.5 kg/week (recommended)</SelectItem>
            <SelectItem value="0.75">0.75 kg/week (moderate)</SelectItem>
            <SelectItem value="1">1 kg/week (aggressive)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Computed targets */}
      <div className="rounded-xl border border-border bg-secondary/50 p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <TrendingDown className="w-4 h-4 text-primary" />
          Your Daily Targets
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Calories", value: `${targets.calories} kcal`, color: "text-primary" },
            { label: "Protein", value: `${targets.protein}g`, color: "text-green-400" },
            { label: "Carbs", value: `${targets.carbs}g`, color: "text-yellow-400" },
            { label: "Fat", value: `${targets.fat}g`, color: "text-orange-400" },
          ].map(t => (
            <div key={t.label} className="bg-card rounded-lg p-3 text-center">
              <p className={`text-lg font-bold ${t.color}`}>{t.value}</p>
              <p className="text-[10px] text-muted-foreground">{t.label}</p>
            </div>
          ))}
        </div>
        {weeksToGoal > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Estimated {weeksToGoal} weeks to reach your goal ({Math.round(weeksToGoal / 4.3)} months)
          </p>
        )}
      </div>

      <Button onClick={() => onSave(form)} className="w-full">
        <Target className="w-4 h-4 mr-2" /> Set Weight Goal
      </Button>
    </div>
  );
}
