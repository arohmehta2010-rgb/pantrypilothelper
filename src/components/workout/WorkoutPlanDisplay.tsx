import { Button } from "@/components/ui/button";
import type { WorkoutPlan } from "@/lib/workoutTypes";
import { ArrowLeft, Dumbbell, Lightbulb } from "lucide-react";

interface Props {
  plan: WorkoutPlan;
  onBack: () => void;
  onRestart: () => void;
}

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

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 font-medium text-muted-foreground">Exercise</th>
                      <th className="pb-2 font-medium text-muted-foreground">Sets</th>
                      <th className="pb-2 font-medium text-muted-foreground">Reps</th>
                      <th className="pb-2 font-medium text-muted-foreground">Rest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {day.exercises.map((ex, j) => (
                      <tr key={j} className="border-b border-border/50 last:border-0">
                        <td className="py-3 font-medium text-foreground">
                          {ex.name}
                          {ex.notes && (
                            <span className="block text-xs text-muted-foreground">{ex.notes}</span>
                          )}
                        </td>
                        <td className="py-3 text-muted-foreground">{ex.sets}</td>
                        <td className="py-3 text-muted-foreground">{ex.reps}</td>
                        <td className="py-3 text-muted-foreground">{ex.rest}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

      {/* Tips */}
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
