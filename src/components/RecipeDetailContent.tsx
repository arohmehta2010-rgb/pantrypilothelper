import { useState } from "react";
import { Clock, Flame, DollarSign, Users, ArrowRight, X, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sampleRecipes } from "@/lib/sampleRecipes";
import type { Recipe } from "@/lib/types";

type FullRecipe = Recipe & { image: string; category: string };

interface RecipeDetailContentProps {
  recipe: FullRecipe;
  onClose: () => void;
  onSelectRecipe?: (recipe: FullRecipe) => void;
}

const RecipeDetailContent = ({ recipe, onClose, onSelectRecipe }: RecipeDetailContentProps) => {
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !customTags.includes(trimmed)) {
      setCustomTags([...customTags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setCustomTags(customTags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  // Find similar recipes by category, excluding the current one
  const similarRecipes = sampleRecipes
    .filter((r) => r.category === recipe.category && r.name !== recipe.name)
    .slice(0, 4);

  return (
    <>
      {/* Hero image */}
      <div className="relative h-56 sm:h-72 overflow-hidden rounded-t-2xl">
        <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <div className="absolute bottom-4 left-6 right-16">
          <span className="text-xs bg-primary/90 text-primary-foreground px-2.5 py-1 rounded-full font-medium">
            {recipe.category}
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-foreground mt-2 drop-shadow-lg">
            {recipe.name}
          </h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <p className="text-muted-foreground text-sm">{recipe.description}</p>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-primary" /> Prep: {recipe.prepTime}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-primary" /> Cook: {recipe.cookTime}</span>
          <span className="flex items-center gap-1"><Users className="w-4 h-4 text-primary" /> {recipe.servings} servings</span>
          <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-primary" /> {recipe.estimatedCost}</span>
        </div>

        {/* Custom Dietary Tags */}
        <section className="rounded-xl border bg-secondary/50 p-5 space-y-3">
          <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" /> Your Dietary Notes
          </h3>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="e.g. Nut-Free, Low Sodium, Extra Protein..."
              className="flex-1 rounded-lg border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
            <Button type="button" onClick={addTag} size="sm" variant="outline" className="gap-1">
              <Plus className="w-3 h-3" /> Add
            </Button>
          </div>
          {customTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {customTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-destructive transition">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {customTags.length === 0 && (
            <p className="text-xs text-muted-foreground">Add custom dietary preferences or notes to this recipe.</p>
          )}
        </section>

        {/* Full Nutrition */}
        <section className="rounded-xl border bg-secondary/50 p-5 space-y-3">
          <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" /> Nutrition Facts
            <span className="text-xs text-muted-foreground font-normal">(per serving)</span>
          </h3>
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
                  highlight ? "bg-primary/15 border border-primary/30" : "bg-card"
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
        <section className="space-y-3">
          <h3 className="text-lg font-display font-semibold text-foreground">Ingredients</h3>
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
        <section className="space-y-3">
          <h3 className="text-lg font-display font-semibold text-foreground">Instructions</h3>
          <ol className="space-y-3">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-xs shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground/90 leading-relaxed pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Tips */}
        {recipe.tips && (
          <section className="rounded-xl border border-primary/30 bg-primary/5 p-5">
            <h3 className="text-base font-display font-semibold text-primary mb-1">💡 Chef's Tips</h3>
            <p className="text-sm text-foreground/80">{recipe.tips}</p>
          </section>
        )}

        {/* Similar Recipes */}
        {similarRecipes.length > 0 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <h3 className="text-lg font-display font-semibold text-foreground whitespace-nowrap">
                Similar Recipes
              </h3>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {similarRecipes.map((similar, i) => (
                <div
                  key={i}
                  className="group rounded-xl border bg-card overflow-hidden hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => onSelectRecipe?.(similar)}
                >
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img
                      src={similar.image}
                      alt={similar.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-2.5 space-y-1">
                    <h4 className="font-display font-semibold text-foreground text-xs leading-tight line-clamp-2">
                      {similar.name}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5 text-primary" /> {similar.nutrition.calories} kcal
                      </span>
                      <span className="flex items-center gap-0.5 text-primary font-medium">
                        View <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="text-center pt-2">
          <Button onClick={onClose} variant="outline" size="lg">Close</Button>
        </div>
      </div>
    </>
  );
};

export default RecipeDetailContent;
