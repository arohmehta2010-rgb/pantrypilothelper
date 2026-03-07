import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, DollarSign, Users, Flame, ArrowRight, X, Sparkles } from "lucide-react";
import type { Recipe } from "@/lib/types";

// Curated Unsplash food images mapped by common keywords
const foodImages: Record<string, string> = {
  chicken: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&h=400&fit=crop",
  pasta: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600&h=400&fit=crop",
  stir: "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=600&h=400&fit=crop",
  rice: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&h=400&fit=crop",
  salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop",
  bowl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop",
  taco: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop",
  salmon: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=600&h=400&fit=crop",
  fish: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&h=400&fit=crop",
  steak: "https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop",
  beef: "https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop",
  curry: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop",
  soup: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop",
  sandwich: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=400&fit=crop",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
  pizza: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
  shrimp: "https://images.unsplash.com/photo-1611250188496-e966043a0629?w=600&h=400&fit=crop",
  egg: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop",
  mushroom: "https://images.unsplash.com/photo-1633436375153-d7045cb93e38?w=600&h=400&fit=crop",
  vegetable: "https://images.unsplash.com/photo-1543339308-d595c4f5c5e7?w=600&h=400&fit=crop",
  vegan: "https://images.unsplash.com/photo-1543339308-d595c4f5c5e7?w=600&h=400&fit=crop",
  wrap: "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=600&h=400&fit=crop",
  cauliflower: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&h=400&fit=crop",
  risotto: "https://images.unsplash.com/photo-1633436375153-d7045cb93e38?w=600&h=400&fit=crop",
  pie: "https://images.unsplash.com/photo-1621532455591-12a882b86c04?w=600&h=400&fit=crop",
  mac: "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=600&h=400&fit=crop",
  cheese: "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=600&h=400&fit=crop",
  noodle: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop",
  pork: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&h=400&fit=crop",
  smoothie: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600&h=400&fit=crop",
  bread: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop",
  pancake: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop",
  dessert: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=400&fit=crop",
  cake: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=400&fit=crop",
};

const defaultImage = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop";

function getRecipeImage(recipe: Recipe): string {
  const searchText = `${recipe.imageQuery || ""} ${recipe.name} ${recipe.category || ""}`.toLowerCase();
  for (const [keyword, url] of Object.entries(foodImages)) {
    if (searchText.includes(keyword)) return url;
  }
  return defaultImage;
}

interface RecipeResultsProps {
  recipes: Recipe[];
  onBack: () => void;
}

const RecipeResults = ({ recipes, onBack }: RecipeResultsProps) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

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
          const image = getRecipeImage(recipe);
          return (
            <div
              key={i}
              className="group rounded-2xl border bg-card overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
              onClick={() => setSelectedRecipe(recipe)}
            >
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  src={image}
                  alt={recipe.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
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

      {/* Detail modal */}
      {selectedRecipe && (
        <RecipeDetailModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </div>
  );
};

const RecipeDetailModal = ({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) => {
  const image = getRecipeImage(recipe);

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

        <div className="relative h-56 sm:h-72 overflow-hidden rounded-t-2xl">
          <img src={image} alt={recipe.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 right-16">
            {recipe.category && (
              <span className="text-xs bg-primary/90 text-primary-foreground px-2.5 py-1 rounded-full font-medium">
                {recipe.category}
              </span>
            )}
            <h2 className="text-2xl sm:text-3xl font-display font-semibold text-foreground mt-2 drop-shadow-lg">
              {recipe.name}
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-muted-foreground text-sm">{recipe.description}</p>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-primary" /> Prep: {recipe.prepTime}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-primary" /> Cook: {recipe.cookTime}</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4 text-primary" /> {recipe.servings} servings</span>
            <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-primary" /> {recipe.estimatedCost}</span>
          </div>

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
                  className={`rounded-xl p-3 text-center ${highlight ? "bg-primary/15 border border-primary/30" : "bg-card"}`}
                >
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-sm font-semibold ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
                </div>
              ))}
            </div>
          </section>

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

          {recipe.tips && (
            <section className="rounded-xl border border-primary/30 bg-primary/5 p-5">
              <h3 className="text-base font-display font-semibold text-primary mb-1">💡 Chef's Tips</h3>
              <p className="text-sm text-foreground/80">{recipe.tips}</p>
            </section>
          )}

          <div className="text-center pt-2">
            <Button onClick={onClose} variant="outline" size="lg">Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeResults;
