import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EQUIPMENT_LIST } from "@/lib/workoutTypes";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface Props {
  onSubmit: (equipmentIds: string[]) => void;
  onBack: () => void;
}

const EquipmentSelector = ({ onSubmit, onBack }: Props) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const categories = [
    { key: "bodyweight", label: "Bodyweight" },
    { key: "free-weights", label: "Free Weights" },
    { key: "machines", label: "Machines" },
    { key: "cardio", label: "Cardio" },
    { key: "accessories", label: "Accessories" },
  ] as const;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          What equipment do you have?
        </h1>
        <p className="mt-2 text-muted-foreground">
          Select everything available to you — we'll build around it
        </p>
      </div>

      {categories.map((cat) => {
        const items = EQUIPMENT_LIST.filter((e) => e.category === cat.key);
        return (
          <div key={cat.key} className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {cat.label}
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {items.map((eq) => (
                <button
                  key={eq.id}
                  type="button"
                  onClick={() => toggle(eq.id)}
                  className={`relative flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                    selected.has(eq.id)
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-foreground hover:border-primary/40"
                  }`}
                >
                  <span className="text-lg">{eq.icon}</span>
                  <span>{eq.name}</span>
                  {selected.has(eq.id) && (
                    <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={() => onSubmit(Array.from(selected))}
          disabled={selected.size === 0}
          className="h-12 flex-1 font-semibold"
        >
          Generate Plan
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EquipmentSelector;
