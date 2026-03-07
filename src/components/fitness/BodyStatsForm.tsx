import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BodyStats } from "@/lib/fitnessTypes";
import { calculateBMI, getBMICategory, calculateTDEE } from "@/lib/fitnessTypes";
import { Save, Activity } from "lucide-react";

interface Props {
  initial: BodyStats | null;
  onSave: (s: BodyStats) => void;
}

export default function BodyStatsForm({ initial, onSave }: Props) {
  const [form, setForm] = useState<BodyStats>(initial ?? {
    age: 25, gender: "male", heightCm: 175, weightKg: 80,
    activityLevel: "moderate", bodyFatPercent: undefined, muscleMassKg: undefined,
    waistCm: undefined, hipCm: undefined,
  });

  const bmi = calculateBMI(form.weightKg, form.heightCm);
  const tdee = calculateTDEE(form);

  const update = (key: keyof BodyStats, val: string | number) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Age</Label>
          <Input type="number" value={form.age} onChange={e => update("age", +e.target.value)} min={10} max={100} />
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select value={form.gender} onValueChange={v => update("gender", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Height (cm)</Label>
          <Input type="number" value={form.heightCm} onChange={e => update("heightCm", +e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Weight (kg)</Label>
          <Input type="number" value={form.weightKg} onChange={e => update("weightKg", +e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Activity Level</Label>
        <Select value={form.activityLevel} onValueChange={v => update("activityLevel", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="sedentary">Sedentary (desk job)</SelectItem>
            <SelectItem value="light">Lightly Active (1-3 days/week)</SelectItem>
            <SelectItem value="moderate">Moderately Active (3-5 days/week)</SelectItem>
            <SelectItem value="active">Active (6-7 days/week)</SelectItem>
            <SelectItem value="very_active">Very Active (2x/day)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-sm font-semibold text-foreground mb-3">Body Composition (optional)</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Body Fat %</Label>
            <Input type="number" placeholder="e.g. 20" value={form.bodyFatPercent ?? ""} onChange={e => update("bodyFatPercent", e.target.value ? +e.target.value : undefined as any)} />
          </div>
          <div className="space-y-2">
            <Label>Muscle Mass (kg)</Label>
            <Input type="number" placeholder="e.g. 35" value={form.muscleMassKg ?? ""} onChange={e => update("muscleMassKg", e.target.value ? +e.target.value : undefined as any)} />
          </div>
          <div className="space-y-2">
            <Label>Waist (cm)</Label>
            <Input type="number" placeholder="e.g. 85" value={form.waistCm ?? ""} onChange={e => update("waistCm", e.target.value ? +e.target.value : undefined as any)} />
          </div>
          <div className="space-y-2">
            <Label>Hip (cm)</Label>
            <Input type="number" placeholder="e.g. 95" value={form.hipCm ?? ""} onChange={e => update("hipCm", e.target.value ? +e.target.value : undefined as any)} />
          </div>
        </div>
      </div>

      {/* BMI & TDEE summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-secondary p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">BMI</p>
          <p className="text-2xl font-bold text-foreground">{bmi}</p>
          <p className="text-xs text-primary font-medium">{getBMICategory(bmi)}</p>
        </div>
        <div className="rounded-xl bg-secondary p-4 text-center">
          <Activity className="w-4 h-4 mx-auto text-primary mb-1" />
          <p className="text-xs text-muted-foreground mb-1">Daily Energy</p>
          <p className="text-2xl font-bold text-foreground">{tdee}</p>
          <p className="text-xs text-muted-foreground">kcal/day (TDEE)</p>
        </div>
      </div>

      <Button onClick={() => onSave(form)} className="w-full">
        <Save className="w-4 h-4 mr-2" /> Save Body Stats
      </Button>
    </div>
  );
}
