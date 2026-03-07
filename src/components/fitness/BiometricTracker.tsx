import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BiometricEntry } from "@/lib/fitnessTypes";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { UnitSystem } from "@/hooks/useUnitSystem";
import { kgToLbs, lbsToKg, cmToIn, inToCm, weightLabel, lengthLabel } from "@/hooks/useUnitSystem";

interface Props {
  entries: BiometricEntry[];
  onAdd: (e: BiometricEntry) => void;
  unit: UnitSystem;
}

export default function BiometricTracker({ entries, onAdd, unit }: Props) {
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [muscle, setMuscle] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");

  const handleAdd = () => {
    if (!weight) return;
    const w = +weight;
    onAdd({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      weightKg: unit === "imperial" ? lbsToKg(w) : w,
      bodyFatPercent: bodyFat ? +bodyFat : undefined,
      muscleMassKg: muscle ? (unit === "imperial" ? lbsToKg(+muscle) : +muscle) : undefined,
      waistCm: waist ? (unit === "imperial" ? inToCm(+waist) : +waist) : undefined,
      hipCm: hip ? (unit === "imperial" ? inToCm(+hip) : +hip) : undefined,
    });
    setWeight(""); setBodyFat(""); setMuscle(""); setWaist(""); setHip("");
  };

  const displayW = (kg: number) => unit === "imperial" ? kgToLbs(kg) : kg;
  const displayL = (cm: number) => unit === "imperial" ? cmToIn(cm) : cm;
  const wUnit = weightLabel(unit);
  const lUnit = lengthLabel(unit);

  const chartData = [...entries].reverse().slice(-30).map(e => ({
    date: new Date(e.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    weight: displayW(e.weightKg),
    bodyFat: e.bodyFatPercent,
  }));

  const trend = entries.length >= 2 ? displayW(entries[0].weightKg) - displayW(entries[1].weightKg) : 0;

  return (
    <div className="space-y-6">
      {/* Quick log */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Weight ({wUnit})*</Label>
          <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder={unit === "imperial" ? "176" : "80"} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Body Fat %</Label>
          <Input type="number" value={bodyFat} onChange={e => setBodyFat(e.target.value)} placeholder="20" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Muscle ({wUnit})</Label>
          <Input type="number" value={muscle} onChange={e => setMuscle(e.target.value)} placeholder={unit === "imperial" ? "77" : "35"} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Waist ({lUnit})</Label>
          <Input type="number" value={waist} onChange={e => setWaist(e.target.value)} placeholder={unit === "imperial" ? "33" : "85"} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Hip ({lUnit})</Label>
          <Input type="number" value={hip} onChange={e => setHip(e.target.value)} placeholder={unit === "imperial" ? "37" : "95"} />
        </div>
        <div className="flex items-end">
          <Button onClick={handleAdd} disabled={!weight} className="w-full">
            <Plus className="w-4 h-4 mr-1" /> Log
          </Button>
        </div>
      </div>

      {/* Trend */}
      {entries.length >= 2 && (
        <div className="flex items-center gap-2 text-sm">
          {trend < 0 ? (
            <><TrendingDown className="w-4 h-4 text-green-400" /> <span className="text-green-400">{Math.abs(trend).toFixed(1)} {wUnit} down from last entry</span></>
          ) : trend > 0 ? (
            <><TrendingUp className="w-4 h-4 text-destructive" /> <span className="text-destructive">{trend.toFixed(1)} {wUnit} up from last entry</span></>
          ) : (
            <span className="text-muted-foreground">No change from last entry</span>
          )}
        </div>
      )}

      {/* Chart */}
      {chartData.length >= 2 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Weight Trend ({wUnit})</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(260 16% 22%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(260 10% 55%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(260 10% 55%)" }} domain={["dataMin - 2", "dataMax + 2"]} />
              <Tooltip contentStyle={{ background: "hsl(260 24% 14%)", border: "1px solid hsl(260 16% 22%)", borderRadius: 8, color: "hsl(340 15% 92%)" }} />
              <Line type="monotone" dataKey="weight" stroke="hsl(260 55% 55%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(260 55% 55%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History */}
      {entries.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Recent Entries</p>
          <div className="max-h-48 overflow-y-auto space-y-1.5">
            {entries.slice(0, 15).map(e => (
              <div key={e.id} className="flex items-center justify-between text-xs bg-secondary rounded-lg px-3 py-2">
                <span className="text-muted-foreground">{new Date(e.date).toLocaleDateString()}</span>
                <div className="flex gap-3">
                  <span className="text-foreground font-medium">{displayW(e.weightKg)} {wUnit}</span>
                  {e.bodyFatPercent && <span className="text-muted-foreground">{e.bodyFatPercent}% BF</span>}
                  {e.waistCm && <span className="text-muted-foreground">{displayL(e.waistCm)} {lUnit} waist</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
