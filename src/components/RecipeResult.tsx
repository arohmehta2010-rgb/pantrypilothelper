import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, DollarSign, Users, Flame } from "lucide-react";
import type { Recipe } from "@/lib/types";

interface RecipeResultProps {
  recipe: Recipe;
  onBack: () => void;
}

const RecipeResult = ({ recipe, onBack }: RecipeResultProps) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-muted-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Generator
      </Button>

      {/* Title */}
      <header className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-display font-semibold text-foreground">
          {recipe.name}
        </h1>
        <p className="text-muted-foreground">{recipe.description}</p>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-primary" /> Prep: {recipe.prepTime}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-primary" /> Cook: {recipe.cookTime}</span>
          <span className="flex items-center gap-1"><Users className="w-4 h-4 text-primary" /> {recipe.servings} servings</span>
          <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-primary" /> {recipe.estimatedCost}</span>
        </div>
      </header>

      {/* Nutrition */}
      <section className="rounded-2xl border bg-card p-6 space-y-4">
        <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" /> Nutrition Facts
          <span className="text-xs text-muted-foreground font-body font-normal">(per serving)</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Calories", value: `${recipe.nutrition.calories} kcal`, highlight: true },
            { label: "Protein", value: recipe.nutrition.protein },
            { label: "Carbs", value: recipe.nutrition.carbs },
            { label: "Fat", value: recipe.nutrition.fat },
            { label: "Fiber", value: recipe.nutrition.fiber },
            { label: "Sugar", value: recipe.nutrition.sugar },
            { label: "Sodium", value: recipe.nutrition.sodium },
          ].map(({ label, value, highlight }) => (
            <div
              key={label}
              className={`rounded-xl p-3 text-center ${
                highlight ? "bg-primary/15 border border-primary/30" : "bg-secondary"
              }`}
            >
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-sm font-semibold ${highlight ? "text-primary" : "text-foreground"}`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Ingredients */}
      <section className="rounded-2xl border bg-card p-6 space-y-4">
        <h2 className="text-xl font-display font-semibold text-foreground">Ingredients</h2>
        <ul className="grid sm:grid-cols-2 gap-2">
          {recipe.ingredients.map(({ item, amount }, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-foreground">
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              <span className="text-muted-foreground">{amount}</span> {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Steps */}
      <section className="rounded-2xl border bg-card p-6 space-y-4">
        <h2 className="text-xl font-display font-semibold text-foreground">Instructions</h2>
        <ol className="space-y-4">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
                {i + 1}
              </span>
              <p className="text-sm text-foreground/90 leading-relaxed pt-1">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Tips */}
      {recipe.tips && (
        <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
          <h2 className="text-lg font-display font-semibold text-primary mb-2">💡 Chef's Tips</h2>
          <p className="text-sm text-foreground/80">{recipe.tips}</p>
        </section>
      )}

      <div className="text-center pb-6">
        <Button onClick={onBack} size="lg" className="font-semibold">
          Generate Another Recipe
        </Button>
      </div>
    </div>
  );
};

export default RecipeResult;
