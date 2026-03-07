import { useState } from "react";
import { Clock, Flame, DollarSign, Users, ArrowRight, X, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sampleRecipes } from "@/lib/sampleRecipes";
import type { Recipe } from "@/lib/types";

type FullRecipe = Recipe & { image: string; category: string };

const categories = ["All", ...Array.from(new Set(sampleRecipes.map((r) => r.category)))];

const RecipeBrowse = ({ onGenerateClick }: { onGenerateClick: () => void }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedRecipe, setSelectedRecipe] = useState<FullRecipe | null>(null);

  const filtered =
    activeCategory === "All"
      ? sampleRecipes
      : sampleRecipes.filter((r) => r.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <header className="text-center space-y-3">
        <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground">
          Popular <span className="text-primary">Recipes</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Browse our curated collection or generate a custom recipe tailored to your ingredients.
        </p>
      </header>

      {/* Category filter */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recipe grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((recipe, i) => (
          <div
            key={i}
            className="group rounded-2xl border bg-card overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
            onClick={() => setSelectedRecipe(recipe)}
          >
            <div className="relative overflow-hidden aspect-[4/3]">
              <img
                src={recipe.image}
                alt={recipe.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground px-2.5 py-1 rounded-full border border-border">
                {recipe.category}
              </span>
            </div>

            <div className="p-4 space-y-3">
              <h3 className="font-display font-semibold text-foreground text-base leading-tight">
                {recipe.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {recipe.description}
              </p>

              {/* Preview nutrition facts */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-secondary rounded-lg p-2 text-center">
                  <Flame className="w-3.5 h-3.5 text-primary mx-auto mb-0.5" />
                  <p className="text-xs font-semibold text-foreground">{recipe.nutrition.calories}</p>
                  <p className="text-[10px] text-muted-foreground">kcal</p>
                </div>
                <div className="bg-secondary rounded-lg p-2 text-center">
                  <p className="text-xs font-semibold text-foreground">{recipe.nutrition.protein}</p>
                  <p className="text-[10px] text-muted-foreground">protein</p>
                </div>
                <div className="bg-secondary rounded-lg p-2 text-center">
                  <p className="text-xs font-semibold text-foreground">{recipe.nutrition.carbs}</p>
                  <p className="text-[10px] text-muted-foreground">carbs</p>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {recipe.cookTime}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> {recipe.estimatedCost}
                </span>
                <span className="flex items-center gap-1 text-primary font-medium">
                  More Info <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Button onClick={onGenerateClick} size="lg" className="font-semibold gap-2">
          <ChefHat className="w-4 h-4" />
          Generate a Custom Recipe
        </Button>
      </div>

      {/* Detail modal */}
      {selectedRecipe && (
        <RecipeDetailModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </div>
  );
};

/* ---------- Detail Modal ---------- */

const RecipeDetailModal = ({
  recipe,
  onClose,
}: {
  recipe: FullRecipe;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 backdrop-blur-sm p-4 pt-10 pb-10" onClick={onClose}>
      <div
        className="relative w-full max-w-3xl rounded-2xl border bg-card shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-background/80 backdrop-blur-sm p-2 border border-border hover:bg-muted transition"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>

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

          <div className="text-center pt-2">
            <Button onClick={onClose} variant="outline" size="lg">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeBrowse;
