import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EQUIPMENT_LIST } from "@/lib/workoutTypes";
import type { EquipmentSelection } from "@/lib/workoutTypes";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  onSubmit: (selections: EquipmentSelection[]) => void;
  onBack: () => void;
}

const EquipmentSelector = ({ onSubmit, onBack }: Props) => {
  const [selected, setSelected] = useState<Map<string, number | undefined>>(new Map());
  const [expandedWeight, setExpandedWeight] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
        if (expandedWeight === id) setExpandedWeight(null);
      } else {
        const eq = EQUIPMENT_LIST.find((e) => e.id === id);
        if (eq?.hasWeight && eq.weightOptions) {
          next.set(id, eq.weightOptions[eq.weightOptions.length - 1]);
          setExpandedWeight(id);
        } else {
          next.set(id, undefined);
        }
      }
      return next;
    });
  };

  const setWeight = (id: string, weight: number) => {
    setSelected((prev) => {
      const next = new Map(prev);
      next.set(id, weight);
      return next;
    });
  };

  const categories = [
    { key: "bodyweight", label: "Bodyweight" },
    { key: "free-weights", label: "Free Weights" },
    { key: "plates-bars", label: "Plates & Bars" },
    { key: "machines", label: "Machines" },
    { key: "cardio", label: "Cardio" },
    { key: "accessories", label: "Accessories" },
  ] as const;

  const handleSubmit = () => {
    const selections: EquipmentSelection[] = Array.from(selected.entries()).map(
      ([id, maxWeight]) => ({ id, maxWeight })
    );
    onSubmit(selections);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5 sm:space-y-7">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          What equipment do you have?
        </h1>
        <p className="text-sm text-muted-foreground">
          Select everything available — set max weight where applicable
        </p>
      </div>

      {categories.map((cat) => {
        const items = EQUIPMENT_LIST.filter((e) => e.category === cat.key);
        if (items.length === 0) return null;
        return (
          <div key={cat.key} className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {cat.label}
            </h3>
            <div className="space-y-1.5">
              {items.map((eq) => {
                const isSelected = selected.has(eq.id);
                const isWeightExpanded = expandedWeight === eq.id;
                const currentWeight = selected.get(eq.id);

                return (
                  <div key={eq.id}>
                    <button
                      type="button"
                      onClick={() => toggle(eq.id)}
                      className={`relative flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                        isSelected
                          ? "border-primary/50 bg-primary/8 text-primary"
                          : "border-border bg-card/30 text-foreground hover:border-muted-foreground/30"
                      }`}
                    >
                      <span className="text-base">{eq.icon}</span>
                      <span className="flex-1">{eq.name}</span>
                      {isSelected && eq.hasWeight && currentWeight && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedWeight(isWeightExpanded ? null : eq.id);
                          }}
                          className="flex items-center gap-1 rounded-md bg-primary/15 px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/25 transition-colors duration-200"
                        >
                          {currentWeight} lbs
                          {isWeightExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                      )}
                      {isSelected && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>

                    {isSelected && eq.hasWeight && eq.weightOptions && isWeightExpanded && (
                      <div className="ml-4 mt-1 mb-1.5 rounded-lg border border-border bg-card/40 p-3">
                        <p className="text-[11px] font-medium text-muted-foreground mb-2">
                          Max weight (lbs):
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {eq.weightOptions.map((w) => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => setWeight(eq.id, w)}
                              className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200 ${
                                currentWeight === w
                                  ? "bg-primary text-primary-foreground glow-primary"
                                  : "bg-secondary border border-border text-foreground hover:border-muted-foreground/40"
                              }`}
                            >
                              {w}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="h-11 flex-1 border-border bg-card/30 hover:bg-card/60 transition-all duration-200">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={selected.size === 0}
          className="h-11 flex-1 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 glow-primary transition-all duration-200"
        >
          Generate Plan
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EquipmentSelector;
