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
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          What equipment do you have?
        </h1>
        <p className="mt-2 text-muted-foreground">
          Select everything available to you — set max weight where applicable
        </p>
      </div>

      {categories.map((cat) => {
        const items = EQUIPMENT_LIST.filter((e) => e.category === cat.key);
        if (items.length === 0) return null;
        return (
          <div key={cat.key} className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {cat.label}
            </h3>
            <div className="space-y-2">
              {items.map((eq) => {
                const isSelected = selected.has(eq.id);
                const isWeightExpanded = expandedWeight === eq.id;
                const currentWeight = selected.get(eq.id);

                return (
                  <div key={eq.id} className="space-y-0">
                    <button
                      type="button"
                      onClick={() => toggle(eq.id)}
                      className={`relative flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-foreground hover:border-primary/40"
                      }`}
                    >
                      <span className="text-lg">{eq.icon}</span>
                      <span className="flex-1">{eq.name}</span>
                      {isSelected && eq.hasWeight && currentWeight && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedWeight(isWeightExpanded ? null : eq.id);
                          }}
                          className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                        >
                          Up to {currentWeight} lbs
                          {isWeightExpanded ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      )}
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>

                    {/* Weight picker */}
                    {isSelected && eq.hasWeight && eq.weightOptions && isWeightExpanded && (
                      <div className="ml-4 mt-1 mb-2 rounded-lg border border-border bg-secondary/30 p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Max weight available (lbs):
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {eq.weightOptions.map((w) => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => setWeight(eq.id, w)}
                              className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                                currentWeight === w
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-card border border-border text-foreground hover:border-primary/40"
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

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleSubmit}
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
