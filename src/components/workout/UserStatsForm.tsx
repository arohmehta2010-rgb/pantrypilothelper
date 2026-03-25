import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { UserStats, WorkoutSplit } from "@/lib/workoutTypes";
import { SPLIT_OPTIONS } from "@/lib/workoutTypes";
import { ArrowRight } from "lucide-react";

interface Props {
  onSubmit: (stats: UserStats) => void;
}

const UserStatsForm = ({ onSubmit }: Props) => {
  const [stats, setStats] = useState<UserStats>({
    gender: "male",
    age: 25,
    weight: 70,
    weightUnit: "kg",
    height: 175,
    heightUnit: "cm",
    fitnessLevel: "beginner",
    goal: "build-muscle",
    split: "push-pull-legs",
  });

  const [customDays, setCustomDays] = useState(4);

  const selectedSplit = SPLIT_OPTIONS.find((s) => s.id === stats.split);
  const daysPerWeek = stats.split === "custom" ? customDays : (selectedSplit?.days ?? 4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...stats });
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Tell us about yourself
        </h1>
        <p className="mt-2 text-muted-foreground">
          We'll use this to create your perfect workout plan
        </p>
      </div>

      {/* Gender */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Gender</Label>
        <RadioGroup
          value={stats.gender}
          onValueChange={(v) => setStats({ ...stats, gender: v as UserStats["gender"] })}
          className="flex gap-3"
        >
          {[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
          ].map((g) => (
            <label
              key={g.value}
              className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                stats.gender === g.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <RadioGroupItem value={g.value} className="sr-only" />
              {g.label}
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Age */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Age</Label>
        <Input
          type="number"
          min={13}
          max={99}
          value={stats.age}
          onChange={(e) => setStats({ ...stats, age: Number(e.target.value) })}
          className="h-12"
        />
      </div>

      {/* Weight */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Weight</Label>
        <div className="flex gap-3">
          <Input
            type="number"
            min={30}
            max={300}
            value={stats.weight}
            onChange={(e) => setStats({ ...stats, weight: Number(e.target.value) })}
            className="h-12 flex-1"
          />
          <Select
            value={stats.weightUnit}
            onValueChange={(v) => setStats({ ...stats, weightUnit: v as "kg" | "lbs" })}
          >
            <SelectTrigger className="h-12 w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">kg</SelectItem>
              <SelectItem value="lbs">lbs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Height */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Height</Label>
        <div className="flex gap-3">
          <Input
            type="number"
            min={100}
            max={250}
            value={stats.height}
            onChange={(e) => setStats({ ...stats, height: Number(e.target.value) })}
            className="h-12 flex-1"
          />
          <Select
            value={stats.heightUnit}
            onValueChange={(v) => setStats({ ...stats, heightUnit: v as "cm" | "ft" })}
          >
            <SelectTrigger className="h-12 w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cm">cm</SelectItem>
              <SelectItem value="ft">ft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fitness Level */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Fitness Level</Label>
        <RadioGroup
          value={stats.fitnessLevel}
          onValueChange={(v) => setStats({ ...stats, fitnessLevel: v as UserStats["fitnessLevel"] })}
          className="flex gap-3"
        >
          {[
            { value: "beginner", label: "Beginner" },
            { value: "intermediate", label: "Intermediate" },
            { value: "advanced", label: "Advanced" },
          ].map((l) => (
            <label
              key={l.value}
              className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                stats.fitnessLevel === l.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <RadioGroupItem value={l.value} className="sr-only" />
              {l.label}
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Goal */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Goal</Label>
        <Select
          value={stats.goal}
          onValueChange={(v) => setStats({ ...stats, goal: v as UserStats["goal"] })}
        >
          <SelectTrigger className="h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lose-weight">Lose Weight</SelectItem>
            <SelectItem value="build-muscle">Build Muscle</SelectItem>
            <SelectItem value="stay-fit">Stay Fit</SelectItem>
            <SelectItem value="increase-strength">Increase Strength</SelectItem>
            <SelectItem value="improve-endurance">Improve Endurance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Workout Split */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Workout Split</Label>
        <div className="space-y-2">
          {SPLIT_OPTIONS.map((split) => (
            <label
              key={split.id}
              className={`flex cursor-pointer items-start gap-4 rounded-lg border-2 px-4 py-3 transition-colors ${
                stats.split === split.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name="split"
                value={split.id}
                checked={stats.split === split.id}
                onChange={() => setStats({ ...stats, split: split.id })}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${stats.split === split.id ? "text-primary" : "text-foreground"}`}>
                    {split.name}
                  </span>
                  {split.days > 0 && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                      {split.days} days/week
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{split.description}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Custom days slider */}
        {stats.split === "custom" && (
          <div className="mt-4 space-y-3 rounded-lg border border-border bg-secondary/30 p-4">
            <Label className="text-sm font-medium">
              Days per Week: <span className="text-primary">{customDays}</span>
            </Label>
            <Slider
              value={[customDays]}
              onValueChange={(v) => setCustomDays(v[0])}
              min={2}
              max={7}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2 days</span>
              <span>7 days</span>
            </div>
          </div>
        )}
      </div>

      <Button type="submit" className="h-12 w-full text-base font-semibold">
        Next: Select Equipment
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
};

export default UserStatsForm;
