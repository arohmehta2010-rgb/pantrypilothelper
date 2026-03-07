import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BodyStats } from "@/lib/fitnessTypes";
import { calculateBMI, getBMICategory, calculateTDEE } from "@/lib/fitnessTypes";
import { Save, Activity } from "lucide-react";
import type { UnitSystem } from "@/hooks/useUnitSystem";
import { kgToLbs, lbsToKg, cmToIn, inToCm, cmToFtIn, ftInToCm, weightLabel, lengthLabel } from "@/hooks/useUnitSystem";

interface Props {
  initial: BodyStats | null;
  onSave: (s: BodyStats) => void;
  unit: UnitSystem;
}

export default function BodyStatsForm({ initial, onSave, unit }: Props) {
  // Internal state is always metric
  const [form, setForm] = useState<BodyStats>(initial ?? {
    age: 25, gender: "male", heightCm: 175, weightKg: 80,
    activityLevel: "moderate", bodyFatPercent: undefined, muscleMassKg: undefined,
    waistCm: undefined, hipCm: undefined,
  });

  const bmi = calculateBMI(form.weightKg, form.heightCm);
  const tdee = calculateTDEE(form);

  const update = (key: keyof BodyStats, val: string | number) => setForm(p => ({ ...p, [key]: val }));

  // Display values (converted from metric)
  const displayWeight = unit === "imperial" ? kgToLbs(form.weightKg) : form.weightKg;
  const displayMuscleMass = form.muscleMassKg != null ? (unit === "imperial" ? kgToLbs(form.muscleMassKg) : form.muscleMassKg) : "";
  const displayWaist = form.waistCm != null ? (unit === "imperial" ? cmToIn(form.waistCm) : form.waistCm) : "";
  const displayHip = form.hipCm != null ? (unit === "imperial" ? cmToIn(form.hipCm) : form.hipCm) : "";

  const heightFtIn = cmToFtIn(form.heightCm);

  const handleWeightChange = (val: string) => {
    const n = +val;
    if (!val) return;
    update("weightKg", unit === "imperial" ? lbsToKg(n) : n);
  };

  const handleHeightChange = (val: string) => {
    const n = +val;
    if (!val) return;
    update("heightCm", unit === "imperial" ? inToCm(n) : n);
  };

  const handleHeightFtChange = (ft: string, inches: string) => {
    update("heightCm", ftInToCm(+ft || 0, +inches || 0));
  };

  const handleOptionalWeight = (key: "muscleMassKg", val: string) => {
    update(key, val ? (unit === "imperial" ? lbsToKg(+val) : +val) : undefined as any);
  };

  const handleOptionalLength = (key: "waistCm" | "hipCm", val: string) => {
    update(key, val ? (unit === "imperial" ? inToCm(+val) : +val) : undefined as any);
  };

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
          <Label>Height ({unit === "imperial" ? "ft/in" : "cm"})</Label>
          {unit === "imperial" ? (
            <div className="flex gap-2">
              <Input type="number" value={heightFtIn.ft} onChange={e => handleHeightFtChange(e.target.value, String(heightFtIn.in))} placeholder="ft" className="w-1/2" />
              <Input type="number" value={heightFtIn.in} onChange={e => handleHeightFtChange(String(heightFtIn.ft), e.target.value)} placeholder="in" className="w-1/2" />
            </div>
          ) : (
            <Input type="number" value={form.heightCm} onChange={e => handleHeightChange(e.target.value)} />
          )}
        </div>
        <div className="space-y-2">
          <Label>Weight ({weightLabel(unit)})</Label>
          <Input type="number" value={displayWeight} onChange={e => handleWeightChange(e.target.value)} />
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
            <Label>Muscle Mass ({weightLabel(unit)})</Label>
            <Input type="number" placeholder={unit === "imperial" ? "e.g. 77" : "e.g. 35"} value={displayMuscleMass} onChange={e => handleOptionalWeight("muscleMassKg", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Waist ({lengthLabel(unit)})</Label>
            <Input type="number" placeholder={unit === "imperial" ? "e.g. 33" : "e.g. 85"} value={displayWaist} onChange={e => handleOptionalLength("waistCm", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Hip ({lengthLabel(unit)})</Label>
            <Input type="number" placeholder={unit === "imperial" ? "e.g. 37" : "e.g. 95"} value={displayHip} onChange={e => handleOptionalLength("hipCm", e.target.value)} />
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
