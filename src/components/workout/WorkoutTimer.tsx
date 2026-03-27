import { useState, useEffect, useCallback, useRef } from "react";
import type { WorkoutPlan, WorkoutDay, WorkoutExercise } from "@/lib/workoutTypes";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pause, RotateCcw, Check, ChevronRight, Timer, Flame, Dumbbell } from "lucide-react";

interface Props {
  plan: WorkoutPlan;
  dayIndex: number;
  onBack: () => void;
  onFinish: () => void;
}

const WorkoutTimer = ({ plan, dayIndex, onBack, onFinish }: Props) => {
  const day = plan.days[dayIndex];
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState<"exercise" | "resting" | "done">("exercise");
  const [restTime, setRestTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const exercise = day.exercises[currentExercise];
  const totalSets = exercise?.sets ?? 3;

  const parseRestSeconds = (rest: string): number => {
    const match = rest.match(/(\d+)/);
    return match ? parseInt(match[1]) : 60;
  };

  // Elapsed timer
  useEffect(() => {
    if (phase === "done") return;
    const id = setInterval(() => {
      if (!paused) setElapsed((p) => p + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [paused, phase]);

  // Rest countdown
  useEffect(() => {
    if (phase !== "resting" || paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRestTime((prev) => {
        if (prev <= 1) {
          setPhase("exercise");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, paused]);

  const completeSet = useCallback(() => {
    const key = `${currentExercise}`;
    const done = (completedSets[key] ?? 0) + 1;
    setCompletedSets((p) => ({ ...p, [key]: done }));

    if (done >= totalSets) {
      // Move to next exercise
      if (currentExercise < day.exercises.length - 1) {
        setCurrentExercise((p) => p + 1);
        setCurrentSet(1);
        setRestTime(parseRestSeconds(exercise.rest));
        setPhase("resting");
      } else {
        setPhase("done");
      }
    } else {
      setCurrentSet(done + 1);
      setRestTime(parseRestSeconds(exercise.rest));
      setPhase("resting");
    }
  }, [currentExercise, completedSets, totalSets, exercise, day.exercises.length]);

  const skipRest = () => {
    setRestTime(0);
    setPhase("exercise");
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const totalCalories = day.exercises.reduce((sum, ex) => sum + (ex.caloriesBurned ?? 0), 0);
  const exercisesDone = Object.keys(completedSets).filter(
    (k) => (completedSets[k] ?? 0) >= day.exercises[parseInt(k)]?.sets
  ).length;
  const progress = (exercisesDone / day.exercises.length) * 100;

  if (phase === "done") {
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center py-12">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 glow-primary">
          <Check className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Workout Complete!</h1>
        <div className="flex justify-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{formatTime(elapsed)}</p>
            <p className="text-xs text-muted-foreground">Duration</p>
          </div>
          {totalCalories > 0 && (
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">~{totalCalories}</p>
              <p className="text-xs text-muted-foreground">Calories</p>
            </div>
          )}
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{day.exercises.length}</p>
            <p className="text-xs text-muted-foreground">Exercises</p>
          </div>
        </div>
        <Button onClick={onFinish} className="h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-semibold">
          Done
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Exit
        </button>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-mono text-foreground">{formatTime(elapsed)}</span>
          <button
            onClick={() => setPaused(!paused)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Day title + progress */}
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-foreground">{day.day} — {day.focus}</h2>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{exercisesDone}/{day.exercises.length} exercises done</p>
      </div>

      {/* Rest countdown */}
      {phase === "resting" && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Rest</p>
          <p className="text-5xl font-bold font-mono text-primary">{formatTime(restTime)}</p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={skipRest} className="border-primary/30 text-primary hover:bg-primary/10">
              Skip Rest <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPaused(!paused)} className="border-border">
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      )}

      {/* Current exercise */}
      {phase === "exercise" && exercise && (
        <div className="rounded-xl border border-border bg-card/40 p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-foreground">{exercise.name}</h3>
              {exercise.notes && <p className="text-xs text-muted-foreground mt-0.5">{exercise.notes}</p>}
            </div>
            {exercise.caloriesBurned && (
              <span className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[11px] font-medium text-orange-400 shrink-0">
                <Flame className="h-3 w-3" /> {exercise.caloriesBurned} cal
              </span>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{currentSet}/{totalSets}</p>
              <p className="text-[11px] text-muted-foreground">Set</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{exercise.reps}</p>
              <p className="text-[11px] text-muted-foreground">Reps</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">{exercise.rest}</p>
              <p className="text-[11px] text-muted-foreground">Rest</p>
            </div>
          </div>

          {exercise.formCues && exercise.formCues.length > 0 && (
            <div className="rounded-lg bg-accent/30 p-3 space-y-1">
              <p className="text-[11px] font-semibold text-foreground">Form cues</p>
              {exercise.formCues.slice(0, 3).map((c, i) => (
                <p key={i} className="text-xs text-muted-foreground">{c}</p>
              ))}
            </div>
          )}

          <Button
            onClick={completeSet}
            className="w-full h-12 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
          >
            <Check className="mr-2 h-5 w-5" />
            Complete Set {currentSet}
          </Button>
        </div>
      )}

      {/* Exercise list */}
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-1">All Exercises</p>
        {day.exercises.map((ex, i) => {
          const done = (completedSets[`${i}`] ?? 0) >= ex.sets;
          const active = i === currentExercise && phase === "exercise";
          return (
            <button
              key={i}
              onClick={() => {
                if (!done) {
                  setCurrentExercise(i);
                  setCurrentSet((completedSets[`${i}`] ?? 0) + 1);
                  setPhase("exercise");
                }
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${
                active ? "bg-primary/10 border border-primary/30" : done ? "opacity-50" : "hover:bg-accent/30"
              }`}
            >
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shrink-0 ${
                done ? "bg-primary text-primary-foreground" : active ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
              }`}>
                {done ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className={`text-sm flex-1 ${active ? "text-foreground font-medium" : done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {ex.name}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">{ex.sets}×{ex.reps}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutTimer;
