import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { NutritionEntry, DailyTargets } from "@/lib/fitnessTypes";
import { Plus, X, Utensils } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  entries: NutritionEntry[];
  targets: DailyTargets | null;
  onAdd: (e: NutritionEntry) => void;
  onRemove: (id: string) => void;
}

export default function NutritionLogger({ entries, targets, onAdd, onRemove }: Props) {
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState<NutritionEntry["mealType"]>("lunch");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const todayEntries = entries.filter(e => e.date.startsWith(today));

  const totals = todayEntries.reduce(
    (acc, e) => ({ calories: acc.calories + e.calories, protein: acc.protein + e.protein, carbs: acc.carbs + e.carbs, fat: acc.fat + e.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleAdd = () => {
    if (!name || !calories) return;
    onAdd({
      id: crypto.randomUUID(), date: new Date().toISOString(), mealType,
      name, calories: +calories, protein: +protein || 0, carbs: +carbs || 0, fat: +fat || 0,
    });
    setName(""); setCalories(""); setProtein(""); setCarbs(""); setFat("");
  };

  const pct = (val: number, target: number) => Math.min(100, Math.round((val / target) * 100));

  return (
    <div className="space-y-6">
      {/* Daily progress */}
      {targets && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Today's Progress</p>
          {[
            { label: "Calories", val: totals.calories, target: targets.calories, unit: "kcal", color: "bg-primary" },
            { label: "Protein", val: totals.protein, target: targets.protein, unit: "g", color: "bg-green-500" },
            { label: "Carbs", val: totals.carbs, target: targets.carbs, unit: "g", color: "bg-yellow-500" },
            { label: "Fat", val: totals.fat, target: targets.fat, unit: "g", color: "bg-orange-500" },
          ].map(m => (
            <div key={m.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{m.label}</span>
                <span className="text-foreground font-medium">{m.val} / {m.target} {m.unit}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full rounded-full transition-all ${m.color}`} style={{ width: `${pct(m.val, m.target)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add entry */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Log a Meal</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <Label className="text-xs">Meal Name*</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Chicken salad" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Meal Type</Label>
            <Select value={mealType} onValueChange={v => setMealType(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Calories*</Label>
            <Input type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="450" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Protein (g)</Label>
            <Input type="number" value={protein} onChange={e => setProtein(e.target.value)} placeholder="30" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Carbs (g)</Label>
            <Input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} placeholder="40" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Fat (g)</Label>
            <Input type="number" value={fat} onChange={e => setFat(e.target.value)} placeholder="15" />
          </div>
        </div>
        <Button onClick={handleAdd} disabled={!name || !calories} className="w-full">
          <Plus className="w-4 h-4 mr-1" /> Log Meal
        </Button>
      </div>

      {/* Today's meals */}
      {todayEntries.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Today's Meals</p>
          {todayEntries.map(e => (
            <div key={e.id} className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2">
              <div>
                <div className="flex items-center gap-2">
                  <Utensils className="w-3 h-3 text-primary" />
                  <span className="text-sm font-medium text-foreground">{e.name}</span>
                  <span className="text-[10px] text-muted-foreground capitalize bg-muted px-1.5 py-0.5 rounded">{e.mealType}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{e.calories} kcal · {e.protein}g P · {e.carbs}g C · {e.fat}g F</p>
              </div>
              <button onClick={() => onRemove(e.id)} className="text-muted-foreground hover:text-destructive transition">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
