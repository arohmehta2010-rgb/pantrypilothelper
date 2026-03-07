import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, DollarSign, Users, Flame, ArrowRight, X, Sparkles } from "lucide-react";
import type { Recipe } from "@/lib/types";
import RecipeDetailContent from "@/components/RecipeDetailContent";

// Comprehensive dish-specific Unsplash photo mappings
// Each entry maps specific dish keywords to a curated, accurate photo
const dishPhotos: [string[], string][] = [
  // Proteins
  [["chicken thigh", "roasted chicken", "baked chicken"], "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&h=400&fit=crop"],
  [["grilled chicken", "chicken breast"], "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&h=400&fit=crop"],
  [["chicken stir fry", "chicken wok"], "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=400&fit=crop"],
  [["chicken curry"], "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=400&fit=crop"],
  [["chicken soup"], "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop"],
  [["chicken wing"], "https://images.unsplash.com/photo-1608039829572-9b0189c8f3d4?w=600&h=400&fit=crop"],
  [["fried chicken"], "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&h=400&fit=crop"],
  [["salmon", "grilled salmon", "baked salmon"], "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop"],
  [["salmon bowl", "salmon teriyaki", "teriyaki bowl"], "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=600&h=400&fit=crop"],
  [["steak", "beef steak", "ribeye", "sirloin"], "https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop"],
  [["shrimp", "prawn", "garlic shrimp"], "https://images.unsplash.com/photo-1611250188496-e966043a0629?w=600&h=400&fit=crop"],
  [["fish", "grilled fish", "baked fish", "white fish"], "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&h=400&fit=crop"],
  [["pork chop", "pork"], "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&h=400&fit=crop"],
  [["turkey", "turkey wrap", "lettuce wrap"], "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=600&h=400&fit=crop"],
  [["lamb", "lamb chop"], "https://images.unsplash.com/photo-1514516345957-556ca7d90a29?w=600&h=400&fit=crop"],
  [["meatball"], "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&h=400&fit=crop"],

  // Pasta & Noodles
  [["pasta carbonara", "carbonara"], "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=400&fit=crop"],
  [["pasta", "spaghetti", "penne", "tuscan pasta", "creamy pasta"], "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600&h=400&fit=crop"],
  [["mac and cheese", "mac cheese", "macaroni"], "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=600&h=400&fit=crop"],
  [["noodle", "ramen", "lo mein", "chow mein"], "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop"],
  [["pad thai"], "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&h=400&fit=crop"],
  [["lasagna", "lasagne"], "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&h=400&fit=crop"],
  [["stuffed shell", "stuffed pasta"], "https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=600&h=400&fit=crop"],

  // Rice & Grains
  [["fried rice", "egg fried rice"], "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=400&fit=crop"],
  [["rice bowl", "grain bowl", "buddha bowl", "power bowl"], "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop"],
  [["risotto", "mushroom risotto"], "https://images.unsplash.com/photo-1633436375153-d7045cb93e38?w=600&h=400&fit=crop"],
  [["biryani"], "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop"],
  [["rice", "steamed rice", "basmati"], "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&h=400&fit=crop"],
  [["quinoa"], "https://images.unsplash.com/photo-1505576399279-0b4b2b8d3d65?w=600&h=400&fit=crop"],

  // Mexican
  [["taco", "tacos"], "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop"],
  [["burrito"], "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop"],
  [["quesadilla"], "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=600&h=400&fit=crop"],
  [["enchilada"], "https://images.unsplash.com/photo-1534352956036-cd81e27dd615?w=600&h=400&fit=crop"],

  // Indian
  [["curry", "chickpea curry", "chana masala"], "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop"],
  [["dal", "daal", "lentil"], "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop"],
  [["naan", "roti", "flatbread", "chapati"], "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=400&fit=crop"],
  [["tikka masala", "butter chicken"], "https://images.unsplash.com/photo-1603894584373-5ac82b2ae328?w=600&h=400&fit=crop"],
  [["paneer"], "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&h=400&fit=crop"],
  [["samosa"], "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop"],
  [["tamarind rice", "puliyodarai"], "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=400&fit=crop"],

  // Soups & Stews
  [["soup", "broth"], "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop"],
  [["stew", "chili", "chilli"], "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&h=400&fit=crop"],
  [["ramen bowl"], "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600&h=400&fit=crop"],

  // Salads & Bowls
  [["salad", "green salad", "caesar"], "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop"],
  [["greek salad"], "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop"],
  [["poke bowl"], "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=600&h=400&fit=crop"],

  // Vegetarian/Vegan
  [["tofu", "tofu stir fry"], "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop"],
  [["cauliflower"], "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&h=400&fit=crop"],
  [["avocado", "avocado toast"], "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop"],
  [["mushroom"], "https://images.unsplash.com/photo-1633436375153-d7045cb93e38?w=600&h=400&fit=crop"],
  [["portobello"], "https://images.unsplash.com/photo-1633436375153-d7045cb93e38?w=600&h=400&fit=crop"],
  [["black bean"], "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?w=600&h=400&fit=crop"],
  [["chickpea", "hummus"], "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop"],
  [["vegetable", "veggie", "vegan"], "https://images.unsplash.com/photo-1543339308-d595c4f5c5e7?w=600&h=400&fit=crop"],
  [["coconut curry"], "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&h=400&fit=crop"],

  // Sandwiches & Burgers
  [["burger", "hamburger"], "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop"],
  [["sandwich", "sub", "panini"], "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=400&fit=crop"],
  [["wrap"], "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=600&h=400&fit=crop"],

  // Breakfast
  [["pancake", "waffle"], "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop"],
  [["omelette", "omelet", "frittata"], "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop"],
  [["smoothie bowl", "acai"], "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600&h=400&fit=crop"],
  [["egg", "scrambled egg", "fried egg"], "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop"],

  // Pizza & Bread
  [["pizza"], "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop"],
  [["bread", "toast", "focaccia"], "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop"],

  // Stir Fry & Asian
  [["stir fry", "stir-fry", "wok"], "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=600&h=400&fit=crop"],
  [["sushi", "maki"], "https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&h=400&fit=crop"],
  [["thai", "basil stir"], "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=600&h=400&fit=crop"],
  [["dumpling", "gyoza", "dim sum"], "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&h=400&fit=crop"],
  [["spring roll"], "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop"],

  // Desserts
  [["cake", "dessert", "brownie"], "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=400&fit=crop"],
  [["cookie", "biscuit"], "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop"],

  // Misc
  [["pot pie", "pie"], "https://images.unsplash.com/photo-1621532455591-12a882b86c04?w=600&h=400&fit=crop"],
  [["sweet potato"], "https://images.unsplash.com/photo-1596097635092-6cf0dbe9d2f1?w=600&h=400&fit=crop"],
  [["smoothie"], "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600&h=400&fit=crop"],
];

const defaultImage = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop";

function getRecipeImage(recipe: Recipe): string {
  // Build search text from imageQuery, name, category, and key ingredients
  const searchText = [
    recipe.imageQuery || "",
    recipe.name,
    recipe.category || "",
    ...recipe.ingredients.slice(0, 3).map(i => i.item),
  ].join(" ").toLowerCase();

  // Try to find the most specific match (longer keyword arrays = more specific)
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const [keywords, url] of dishPhotos) {
    let matchCount = 0;
    for (const kw of keywords) {
      if (searchText.includes(kw)) matchCount++;
    }
    if (matchCount > 0) {
      // Prefer matches where the keyword is more specific (longer string)
      const specificity = keywords.reduce((sum, kw) => {
        return searchText.includes(kw) ? sum + kw.length : sum;
      }, 0);
      if (specificity > bestScore) {
        bestScore = specificity;
        bestMatch = url;
      }
    }
  }

  return bestMatch || defaultImage;
}

interface RecipeResultsProps {
  recipes: Recipe[];
  onBack: () => void;
}

const RecipeResults = ({ recipes, onBack }: RecipeResultsProps) => {
  const [selectedRecipe, setSelectedRecipe] = useState<(Recipe & { image: string; category: string }) | null>(null);

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
              onClick={() => setSelectedRecipe({ ...recipe, image, category: recipe.category || "General" })}
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
