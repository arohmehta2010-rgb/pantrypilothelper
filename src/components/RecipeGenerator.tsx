import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ChefHat, X } from "lucide-react";
import type { Recipe } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

const dietOptions = [
  "No Restrictions", "Vegetarian", "Vegan", "Keto", "Paleo",
  "Gluten-Free", "Dairy-Free", "Low-Carb", "High-Protein", "Mediterranean",
];

const preferenceOptions = [
  "Quick & Easy", "Budget-Friendly", "Comfort Food", "Healthy",
  "Spicy", "Mild", "Kid-Friendly", "Meal Prep", "One-Pot", "Under 30 min",
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
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight text-foreground">
          Generate a <span className="text-primary">Recipe</span>
        </h1>
        <p className="text-muted-foreground">
          Tell us about your diet, preferences, and what ingredients you have.
        </p>
      </header>

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

      {/* Generate */}
      <Button
        onClick={handleGenerate}
        disabled={isLoading || ingredientList.length === 0}
        size="lg"
        className="w-full text-base font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating Recipe...
          </>
        ) : (
          <>
            <ChefHat className="w-4 h-4" />
            Generate Recipe
          </>
        )}
      </Button>
    </div>
  );
};

export default RecipeGenerator;
