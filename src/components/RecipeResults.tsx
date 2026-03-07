import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, DollarSign, Flame, ArrowRight, X, Sparkles } from "lucide-react";
import type { Recipe } from "@/lib/types";
import RecipeDetailContent from "@/components/RecipeDetailContent";
import { getRecipeImage } from "@/lib/recipeImages";

type RecipeWithImage = Recipe & { image?: string };

const fallbackImage = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop";

interface RecipeResultsProps {
  recipes: RecipeWithImage[];
  onBack: () => void;
}

const RecipeResults = ({ recipes, onBack }: RecipeResultsProps) => {
  const [selectedRecipe, setSelectedRecipe] = useState<(Recipe & { image: string; category: string }) | null>(null);

  // Use Pexels image from API if available, otherwise fallback to local matching
  const usedUrls = new Set<string>();
  const getImage = (recipe: RecipeWithImage): string => {
    if (recipe.image) return recipe.image;
    return getRecipeImage(recipe, usedUrls);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Generator
        </Button>
      </div>

      <header className="text-center space-y-3">
        <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground">
          <Sparkles className="w-7 h-7 inline mr-2 text-primary" />
          Your Custom <span className="text-primary">Recipes</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          We generated {recipes.length} personalized recipes based on your ingredients and preferences.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {recipes.map((recipe, i) => {
          const image = getImage(recipe);
          return (
            <div
              key={i}
              className="group rounded-2xl border bg-card overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
              onClick={() => setSelectedRecipe({ ...recipe, image, category: recipe.category || "General" })}
            >
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  src={image}
                  alt={recipe.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
                />
                {recipe.category && (
                  <span className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground px-2.5 py-1 rounded-full border border-border">
                    {recipe.category}
                  </span>
                )}
              </div>

              <div className="p-4 space-y-3">
                <h3 className="font-display font-semibold text-foreground text-base leading-tight">
                  {recipe.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {recipe.description}
                </p>

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
          );
        })}
      </div>

      <div className="text-center pt-4">
        <Button onClick={onBack} size="lg" className="font-semibold">
          Generate More Recipes
        </Button>
      </div>

      {selectedRecipe && (
        <RecipeDetailModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </div>
  );
};

const RecipeDetailModal = ({ recipe, onClose }: { recipe: Recipe & { image: string; category: string }; onClose: () => void }) => {
  const [currentRecipe, setCurrentRecipe] = useState(recipe);

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

export default RecipeResults;
