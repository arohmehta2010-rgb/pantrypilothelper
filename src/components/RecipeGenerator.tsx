import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ChefHat, X, Clock, DollarSign, Flame, ArrowRight, Users, Sparkles } from "lucide-react";
import type { Recipe } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { sampleRecipes } from "@/lib/sampleRecipes";

type FullRecipe = Recipe & { image: string; category: string };

const dietOptions = [
  "No Restrictions", "Vegetarian", "Vegan", "Keto", "Paleo",
  "Gluten-Free", "Dairy-Free", "Low-Carb", "High-Protein", "Mediterranean",
];

const preferenceOptions = [
  "Quick & Easy", "Budget-Friendly", "Comfort Food", "Healthy",
  "Spicy", "Mild", "Kid-Friendly", "Meal Prep", "One-Pot", "Under 30 min",
];

// Popularity order (index = rank, lower = more popular)
const popularityOrder = [
  "Classic Beef Tacos",
  "Creamy Tuscan Pasta",
  "Mac & Cheese (From Scratch)",
  "Egg Fried Rice",
  "Grilled Lemon Herb Chicken",
  "Chicken Pot Pie",
  "Thai Basil Stir-Fry",
  "Salmon Teriyaki Bowl",
  "Spicy Shrimp Tacos",
  "15-Minute Garlic Shrimp Pasta",
  "Steak & Sweet Potato",
  "Greek Chicken Power Bowl",
  "Avocado & Black Bean Bowl",
  "Coconut Chickpea Curry",
  "Mushroom Risotto",
  "Roasted Cauliflower Tacos",
  "Mediterranean Grilled Fish",
  "Turkey Lettuce Wraps",
  "Caprese Stuffed Portobello",
  "Spinach & Ricotta Stuffed Shells",
];

interface RecipeGeneratorProps {
  onRecipeGenerated: (recipe: Recipe) => void;
}

const RecipeGenerator = ({ onRecipeGenerated }: RecipeGeneratorProps) => {
  const [diet, setDiet] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState("");
  const [ingredientList, setIngredientList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<FullRecipe | null>(null);

  const toggleSelection = (
    item: string,
    list: string[],
    setList: (l: string[]) => void
  ) => {
    setList(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
    );
  };

  const addIngredient = () => {
    const trimmed = ingredients.trim();
    if (trimmed && !ingredientList.includes(trimmed)) {
      setIngredientList([...ingredientList, trimmed]);
      setIngredients("");
    }
  };

  const removeIngredient = (item: string) => {
    setIngredientList(ingredientList.filter((i) => i !== item));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  };

  // Match & rank sample recipes by ingredients + diet/preferences
  const matchedRecipes = useMemo(() => {
    if (ingredientList.length === 0) return [];

    const userIngredients = ingredientList.map((i) => i.toLowerCase());
    const userDiets = diet.map((d) => d.toLowerCase());

    return sampleRecipes
      .map((recipe) => {
        // Count ingredient matches
        const recipeIngredients = recipe.ingredients.map((ri) =>
          (ri.item + " " + ri.amount).toLowerCase()
        );
        const matchCount = userIngredients.filter((ui) =>
          recipeIngredients.some((ri) => ri.includes(ui))
        ).length;

        // Check diet compatibility
        const categoryLower = recipe.category.toLowerCase();
        let dietMatch = true;
        if (userDiets.includes("vegetarian") && !["vegetarian", "vegan"].includes(categoryLower)) {
          // Allow vegetarian + vegan categories
          const hasOnlyVegIngredients = !recipeIngredients.some((ri) =>
            ["chicken", "beef", "pork", "shrimp", "salmon", "fish", "turkey", "steak", "meat"].some((m) => ri.includes(m))
          );
          dietMatch = hasOnlyVegIngredients;
        }
        if (userDiets.includes("vegan") && categoryLower !== "vegan") {
          const hasAnimalProducts = recipeIngredients.some((ri) =>
            ["chicken", "beef", "pork", "shrimp", "salmon", "fish", "turkey", "steak", "meat", "cheese", "cream", "butter", "egg", "mozzarella", "parmesan", "ricotta", "feta", "sour cream", "milk"].some((m) => ri.includes(m))
          );
          dietMatch = !hasAnimalProducts;
        }

        if (!dietMatch) return null;

        // Popularity rank
        const popIndex = popularityOrder.indexOf(recipe.name);
        const popScore = popIndex >= 0 ? popularityOrder.length - popIndex : 0;

        return {
          ...recipe,
          matchCount,
          score: matchCount * 10 + popScore,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null && r.matchCount > 0)
      .sort((a, b) => b.score - a.score);
  }, [ingredientList, diet]);

  const handleGenerate = async () => {
    if (ingredientList.length === 0) {
      toast.error("Please add at least one ingredient.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-recipe", {
        body: {
          diet: diet.length > 0 ? diet : ["No Restrictions"],
          preferences,
          ingredients: ingredientList,
        },
      });

      if (error) {
        console.error("Function error:", error);
        toast.error("Failed to generate recipe. Please try again.");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      onRecipeGenerated(data.recipe);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight text-foreground">
          Generate a <span className="text-primary">Recipe</span>
        </h1>
        <p className="text-muted-foreground">
          Tell us about your diet, preferences, and what ingredients you have.
        </p>
      </header>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Diet */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground">
            Dietary Restrictions
          </label>
          <div className="flex flex-wrap gap-2">
            {dietOptions.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleSelection(d, diet, setDiet)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  diet.includes(d)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground">
            Food Preferences
          </label>
          <div className="flex flex-wrap gap-2">
            {preferenceOptions.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => toggleSelection(p, preferences, setPreferences)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  preferences.includes(p)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground">
            Your Ingredients
          </label>
          <div className="flex gap-2">
            <input
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type an ingredient and press Enter..."
              className="flex-1 rounded-lg border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
            <Button type="button" onClick={addIngredient} variant="outline">
              Add
            </Button>
          </div>
          {ingredientList.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {ingredientList.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm"
                >
                  {item}
                  <button
                    onClick={() => removeIngredient(item)}
                    className="hover:text-destructive transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Generate AI recipe */}
        <Button
          onClick={handleGenerate}
          disabled={isLoading || ingredientList.length === 0}
          size="lg"
          className="w-full text-base font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Custom Recipe...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Custom AI Recipe
            </>
          )}
        </Button>
      </div>

      {/* Matched recipes from library */}
      {ingredientList.length > 0 && matchedRecipes.length > 0 && (
        <div className="space-y-5 pt-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <h2 className="text-lg font-display font-semibold text-foreground whitespace-nowrap">
              <ChefHat className="w-5 h-5 inline mr-1.5 text-primary" />
              Matching Recipes <span className="text-muted-foreground font-normal text-sm">({matchedRecipes.length} found)</span>
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <p className="text-center text-sm text-muted-foreground -mt-2">
            Sorted by best match & popularity
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {matchedRecipes.map((recipe, i) => (
              <div
                key={i}
                className="group rounded-2xl border bg-card overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
                onClick={() => setSelectedPreview(recipe)}
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
                  <span className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {recipe.matchCount} match{recipe.matchCount > 1 ? "es" : ""}
                  </span>
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
            ))}
          </div>
        </div>
      )}

      {ingredientList.length > 0 && matchedRecipes.length === 0 && (
        <p className="text-center text-sm text-muted-foreground pt-4">
          No matching recipes found in our library — try generating a custom AI recipe above!
        </p>
      )}

      {/* Detail modal */}
      {selectedPreview && (
        <RecipePreviewModal recipe={selectedPreview} onClose={() => setSelectedPreview(null)} />
      )}
    </div>
  );
};

/* ---------- Detail Modal ---------- */
const RecipePreviewModal = ({
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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-background/80 backdrop-blur-sm p-2 border border-border hover:bg-muted transition"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>

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

export default RecipeGenerator;
