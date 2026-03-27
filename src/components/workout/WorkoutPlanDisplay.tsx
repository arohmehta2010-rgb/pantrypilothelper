import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WorkoutPlan, WorkoutExercise } from "@/lib/workoutTypes";
import { ArrowLeft, Dumbbell, Lightbulb, ChevronDown, ChevronUp, Target, AlertTriangle, CheckCircle2, Save, Check, Flame, Clock, Zap } from "lucide-react";

interface Props {
  plan: WorkoutPlan;
  onBack: () => void;
  onRestart: () => void;
  onSave?: (name: string) => void;
}

const ExerciseDemo = ({ exercise }: { exercise: WorkoutExercise }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border/30 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 py-3 text-left hover:bg-accent/30 transition-colors duration-200 px-1 rounded"
      >
        <div className="flex-1 min-w-0">
          <span className="font-medium text-foreground text-sm">{exercise.name}</span>
          {exercise.notes && (
            <span className="block text-xs text-muted-foreground mt-0.5">{exercise.notes}</span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {exercise.caloriesBurned && (
            <span className="flex items-center gap-1 text-[11px] text-orange-400 font-medium">
              <Flame className="h-3 w-3" />
              {exercise.caloriesBurned}
            </span>
          )}
          <span className="text-[11px] sm:text-xs text-muted-foreground whitespace-nowrap font-mono">{exercise.sets}×{exercise.reps}</span>
          <span className="text-[11px] sm:text-xs text-muted-foreground/60 whitespace-nowrap hidden sm:inline">{exercise.rest}</span>
        </div>
        <div className="text-muted-foreground/40">
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>

      {open && (
        <div className="pb-4 px-1 space-y-3">
          {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
            <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Target Muscles</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {exercise.targetMuscles.map((m, i) => (
                  <span key={i} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {exercise.formCues && exercise.formCues.length > 0 && (
            <div className="rounded-lg bg-success/5 border border-success/10 p-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                <span className="text-xs font-semibold text-foreground">Proper Form</span>
              </div>
              <ol className="space-y-1 list-decimal list-inside">
                {exercise.formCues.map((cue, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed">{cue}</li>
                ))}
              </ol>
            </div>
          )}

          {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
            <div className="rounded-lg bg-destructive/5 border border-destructive/10 p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                <span className="text-xs font-semibold text-foreground">Common Mistakes</span>
              </div>
              <ul className="space-y-1">
                {exercise.commonMistakes.map((mistake, i) => (
                  <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                    <span className="text-destructive shrink-0">✗</span>
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const WorkoutPlanDisplay = ({ plan, onBack, onRestart, onSave }: Props) => {
  const [saveName, setSaveName] = useState(plan.title);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (onSave && saveName.trim()) {
      onSave(saveName.trim());
      setSaved(true);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5 sm:space-y-7 px-0">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {plan.title}
        </h1>
        <p className="text-sm text-muted-foreground">{plan.summary}</p>
        {plan.weeklyCalories && (
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1.5">
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-xs font-semibold text-orange-400">~{plan.weeklyCalories} cal/week</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">{plan.days.length} days/week</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {plan.days.map((day, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-border bg-card/40"
          >
            <div className="flex items-center gap-3 border-b border-border/50 bg-secondary/30 px-5 py-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Dumbbell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{day.day}</h3>
                <p className="text-xs text-muted-foreground">{day.focus}</p>
              </div>
              <div className="ml-auto flex items-center gap-3">
                {day.estimatedDuration && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {day.estimatedDuration}
                  </span>
                )}
                {day.totalCalories && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-orange-400">
                    <Flame className="h-3 w-3" />
                    {day.totalCalories} cal
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 space-y-3">
              {day.warmup && (
                <div className="rounded-lg bg-accent/30 px-3.5 py-2.5 text-xs">
                  <span className="font-semibold text-foreground">Warm-up: </span>
                  <span className="text-muted-foreground">{day.warmup}</span>
                </div>
              )}

              <div className="flex items-center gap-3 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 border-b border-border/30 pb-2">
                <div className="flex-1">Exercise</div>
                <div className="whitespace-nowrap">Sets × Reps</div>
                <div className="whitespace-nowrap hidden sm:block">Rest</div>
                <div className="w-3.5" />
              </div>

              <div>
                {day.exercises.map((ex, j) => (
                  <ExerciseDemo key={j} exercise={ex} />
                ))}
              </div>

              {day.cooldown && (
                <div className="rounded-lg bg-accent/30 px-3.5 py-2.5 text-xs">
                  <span className="font-semibold text-foreground">Cool-down: </span>
                  <span className="text-muted-foreground">{day.cooldown}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {plan.tips.length > 0 && (
        <div className="rounded-xl border border-border bg-card/40 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Tips</h3>
          </div>
          <ul className="space-y-1.5">
            {plan.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                <span className="text-primary shrink-0">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {onSave && (
        <div className="rounded-xl border border-border bg-card/40 p-4">
          {saved ? (
            <div className="flex items-center gap-2 text-sm text-primary font-medium justify-center py-1">
              <Check className="h-4 w-4" />
              Plan saved!
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Plan name..."
                className="h-10 bg-card/40 border-border"
              />
              <Button onClick={handleSave} className="h-10 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="h-11 flex-1 border-border bg-card/30 hover:bg-card/60">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onRestart} className="h-11 flex-1 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
          Start Over
        </Button>
      </div>
    </div>
  );
};

export default WorkoutPlanDisplay;
