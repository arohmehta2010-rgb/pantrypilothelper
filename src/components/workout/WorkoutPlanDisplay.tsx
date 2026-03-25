import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { WorkoutPlan, WorkoutExercise } from "@/lib/workoutTypes";
import { ArrowLeft, Dumbbell, Lightbulb, ChevronDown, ChevronUp, Target, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Props {
  plan: WorkoutPlan;
  onBack: () => void;
  onRestart: () => void;
}

const ExerciseDemo = ({ exercise }: { exercise: WorkoutExercise }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 py-3 text-left hover:bg-secondary/20 transition-colors px-1 rounded"
      >
        <div className="flex-1 min-w-0">
          <span className="font-medium text-foreground">{exercise.name}</span>
          {exercise.notes && (
            <span className="block text-xs text-muted-foreground">{exercise.notes}</span>
          )}
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">{exercise.sets} × {exercise.reps}</span>
        <span className="text-xs text-muted-foreground whitespace-nowrap">{exercise.rest}</span>
        <div className="text-muted-foreground">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {open && (
        <div className="pb-4 pl-1 pr-1 space-y-4">
          {/* Target Muscles */}
          {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
            <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Target Muscles</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {exercise.targetMuscles.map((m, i) => (
                  <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Form Cues */}
          {exercise.formCues && exercise.formCues.length > 0 && (
            <div className="rounded-lg bg-success/5 border border-success/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm font-semibold text-foreground">Proper Form</span>
              </div>
              <ol className="space-y-1.5 list-decimal list-inside">
                {exercise.formCues.map((cue, i) => (
                  <li key={i} className="text-sm text-muted-foreground">{cue}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Common Mistakes */}
          {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
            <div className="rounded-lg bg-destructive/5 border border-destructive/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-semibold text-foreground">Common Mistakes</span>
              </div>
              <ul className="space-y-1.5">
                {exercise.commonMistakes.map((mistake, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-destructive">✗</span>
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

const WorkoutPlanDisplay = ({ plan, onBack, onRestart }: Props) => {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {plan.title}
        </h1>
        <p className="mt-2 text-muted-foreground">{plan.summary}</p>
      </div>

      <div className="space-y-6">
        {plan.days.map((day, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="flex items-center gap-3 border-b border-border bg-secondary/50 px-6 py-4">
              <Dumbbell className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">{day.day}</h3>
                <p className="text-sm text-muted-foreground">{day.focus}</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {day.warmup && (
                <div className="rounded-lg bg-secondary/30 px-4 py-3 text-sm">
                  <span className="font-medium text-foreground">Warm-up: </span>
                  <span className="text-muted-foreground">{day.warmup}</span>
                </div>
              )}

              {/* Exercise header row */}
              <div className="flex items-center gap-3 px-1 text-xs font-medium text-muted-foreground border-b border-border pb-2">
                <div className="flex-1">Exercise</div>
                <div className="whitespace-nowrap">Sets × Reps</div>
                <div className="whitespace-nowrap">Rest</div>
                <div className="w-4" />
              </div>

              {/* Exercise rows with expandable demos */}
              <div>
                {day.exercises.map((ex, j) => (
                  <ExerciseDemo key={j} exercise={ex} />
                ))}
              </div>

              {day.cooldown && (
                <div className="rounded-lg bg-secondary/30 px-4 py-3 text-sm">
                  <span className="font-medium text-foreground">Cool-down: </span>
                  <span className="text-muted-foreground">{day.cooldown}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {plan.tips.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Tips</h3>
          </div>
          <ul className="space-y-2">
            {plan.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-primary">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onRestart} className="h-12 flex-1 font-semibold">
          Start Over
        </Button>
      </div>
    </div>
  );
};

export default WorkoutPlanDisplay;
