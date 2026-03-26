import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { UserStats, WorkoutSplit, DayFocus } from "@/lib/workoutTypes";
import { SPLIT_OPTIONS, DAY_FOCUS_OPTIONS, SPLIT_PRESETS } from "@/lib/workoutTypes";
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
  const [dayFocuses, setDayFocuses] = useState<DayFocus[]>(["push", "pull", "legs", "upper"]);

  const selectedSplit = SPLIT_OPTIONS.find((s) => s.id === stats.split);
  const daysPerWeek = stats.split === "custom" ? customDays : (selectedSplit?.days ?? 4);

  const updateCustomDays = (newCount: number) => {
    setCustomDays(newCount);
    setDayFocuses((prev) => {
      if (newCount > prev.length) {
        return [...prev, ...Array(newCount - prev.length).fill("full-body" as DayFocus)];
      }
      return prev.slice(0, newCount);
    });
  };

  const updateDayFocus = (dayIndex: number, focus: DayFocus) => {
    setDayFocuses((prev) => {
      const next = [...prev];
      next[dayIndex] = focus;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...stats,
      ...(stats.split === "custom" ? { customDayFocuses: dayFocuses } : {}),
    });
  };

  const OptionButton = ({
    active,
    children,
    onClick,
    className = "",
  }: {
    active: boolean;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-200 ${
        active
          ? "border-primary/50 bg-primary/10 text-primary glow-primary"
          : "border-border bg-card/40 text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
      } ${className}`}
    >
      {children}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-7">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Tell us about yourself
        </h1>
        <p className="text-sm text-muted-foreground">
          We'll use this to create your perfect workout plan
        </p>
      </div>

      {/* Gender */}
      <div className="space-y-2.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gender</Label>
        <RadioGroup
          value={stats.gender}
          onValueChange={(v) => setStats({ ...stats, gender: v as UserStats["gender"] })}
          className="flex gap-2"
        >
          {[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
          ].map((g) => (
            <label key={g.value} className="flex-1">
              <RadioGroupItem value={g.value} className="sr-only" />
              <OptionButton active={stats.gender === g.value}>{g.label}</OptionButton>
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Age */}
      <div className="space-y-2.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Age</Label>
        <Input
          type="number"
          min={13}
          max={99}
          value={stats.age}
          onChange={(e) => setStats({ ...stats, age: Number(e.target.value) })}
          className="h-11 bg-card/40 border-border"
        />
      </div>

      {/* Weight */}
      <div className="space-y-2.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weight</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            min={30}
            max={300}
            value={stats.weight}
            onChange={(e) => setStats({ ...stats, weight: Number(e.target.value) })}
            className="h-11 flex-1 bg-card/40 border-border"
          />
          <Select
            value={stats.weightUnit}
            onValueChange={(v) => setStats({ ...stats, weightUnit: v as "kg" | "lbs" })}
          >
            <SelectTrigger className="h-11 w-20 bg-card/40 border-border">
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
      <div className="space-y-2.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Height</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            min={100}
            max={250}
            value={stats.height}
            onChange={(e) => setStats({ ...stats, height: Number(e.target.value) })}
            className="h-11 flex-1 bg-card/40 border-border"
          />
          <Select
            value={stats.heightUnit}
            onValueChange={(v) => setStats({ ...stats, heightUnit: v as "cm" | "ft" })}
          >
            <SelectTrigger className="h-11 w-20 bg-card/40 border-border">
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
      <div className="space-y-2.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fitness Level</Label>
        <RadioGroup
          value={stats.fitnessLevel}
          onValueChange={(v) => setStats({ ...stats, fitnessLevel: v as UserStats["fitnessLevel"] })}
          className="flex gap-2"
        >
          {[
            { value: "beginner", label: "Beginner" },
            { value: "intermediate", label: "Intermediate" },
            { value: "advanced", label: "Advanced" },
          ].map((l) => (
            <label key={l.value} className="flex-1">
              <RadioGroupItem value={l.value} className="sr-only" />
              <OptionButton active={stats.fitnessLevel === l.value}>{l.label}</OptionButton>
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Goal */}
      <div className="space-y-2.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Goal</Label>
        <Select
          value={stats.goal}
          onValueChange={(v) => setStats({ ...stats, goal: v as UserStats["goal"] })}
        >
          <SelectTrigger className="h-11 bg-card/40 border-border">
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
      <div className="space-y-2.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workout Split</Label>
        <div className="space-y-1.5">
          {SPLIT_OPTIONS.map((split) => (
            <button
              key={split.id}
              type="button"
              onClick={() => setStats({ ...stats, split: split.id })}
              className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-200 ${
                stats.split === split.id
                  ? "border-primary/50 bg-primary/8 glow-primary"
                  : "border-border bg-card/30 hover:border-muted-foreground/30"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${stats.split === split.id ? "text-primary" : "text-foreground"}`}>
                    {split.name}
                  </span>
                  {split.days > 0 && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {split.days}d/wk
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{split.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Custom days */}
        {stats.split === "custom" && (
          <div className="mt-3 space-y-4 rounded-lg border border-border bg-card/30 p-4">
            {/* Presets */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Presets</Label>
              <div className="flex flex-wrap gap-1.5">
                {SPLIT_PRESETS.map((preset) => {
                  const isActive =
                    customDays === preset.days.length &&
                    dayFocuses.slice(0, preset.days.length).every((f, i) => f === preset.days[i]);
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setCustomDays(preset.days.length);
                        setDayFocuses([...preset.days]);
                      }}
                      className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-all duration-200 ${
                        isActive
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                      }`}
                    >
                      {preset.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-xs font-semibold text-muted-foreground">
                Days per Week: <span className="text-primary">{customDays}</span>
              </Label>
              <Slider
                value={[customDays]}
                onValueChange={(v) => updateCustomDays(v[0])}
                min={2}
                max={7}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground/60">
                <span>2 days</span>
                <span>7 days</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Focus for each day</Label>
              {Array.from({ length: customDays }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-12 text-[11px] font-medium text-muted-foreground/60 shrink-0">Day {i + 1}</span>
                  <Select
                    value={dayFocuses[i] || "full-body"}
                    onValueChange={(v) => updateDayFocus(i, v as DayFocus)}
                  >
                    <SelectTrigger className="h-9 bg-card/40 border-border text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAY_FOCUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.emoji} {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button type="submit" className="h-11 w-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 glow-primary transition-all duration-200">
        Next: Select Equipment
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
};

export default UserStatsForm;
