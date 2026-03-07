import { useState } from "react";
import { Clock, Flame, DollarSign, Users, ArrowRight, X, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sampleRecipes } from "@/lib/sampleRecipes";
import type { Recipe } from "@/lib/types";
import RecipeDetailContent from "@/components/RecipeDetailContent";

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
  const [currentRecipe, setCurrentRecipe] = useState<FullRecipe>(recipe);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 backdrop-blur-sm p-4 pt-10 pb-10" onClick={onClose}>
      <div
        className="relative w-full max-w-3xl rounded-2xl border bg-card shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-background/80 backdrop-blur-sm p-2 border border-border hover:bg-muted transition"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>

        <RecipeDetailContent
          recipe={currentRecipe}
          onClose={onClose}
          onSelectRecipe={(r) => setCurrentRecipe(r)}
        />
      </div>
    </div>
  );
};

export default RecipeBrowse;
