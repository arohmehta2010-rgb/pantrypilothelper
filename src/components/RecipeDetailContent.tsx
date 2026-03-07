import { useState } from "react";
import { Clock, Flame, DollarSign, Users, ArrowRight, X, Plus, Tag, BookOpen, Loader2, ShieldCheck, Wheat, MilkOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sampleRecipes } from "@/lib/sampleRecipes";
import type { Recipe } from "@/lib/types";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

type FullRecipe = Recipe & { image: string; category: string };

interface Alternative {
  dietLabel: string;
  name: string;
  description: string;
  keySwaps: string[];
  nutrition: { calories: number; protein: string; carbs: string; fat: string };
}

interface RecipeDetailContentProps {
  recipe: FullRecipe;
  onClose: () => void;
  onSelectRecipe?: (recipe: FullRecipe) => void;
}

const TUTORIAL_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-tutorial`;

const RecipeDetailContent = ({ recipe, onClose, onSelectRecipe }: RecipeDetailContentProps) => {
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tutorialContent, setTutorialContent] = useState("");
  const [isTutorialLoading, setIsTutorialLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [isAlternativesLoading, setIsAlternativesLoading] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

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

  const generateTutorial = async () => {
    if (tutorialContent) {
      setShowTutorial(!showTutorial);
      return;
    }

    setShowTutorial(true);
    setIsTutorialLoading(true);
    setTutorialContent("");

    try {
      const resp = await fetch(TUTORIAL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          recipeName: recipe.name,
          description: recipe.description,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          tips: recipe.tips,
        }),
      });

      if (resp.status === 429) {
        toast.error("Too many requests. Please wait a moment and try again.");
        setIsTutorialLoading(false);
        setShowTutorial(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("AI usage limit reached. Please try again later.");
        setIsTutorialLoading(false);
        setShowTutorial(false);
        return;
      }
      if (!resp.ok || !resp.body) {
        toast.error("Failed to generate tutorial. Please try again.");
        setIsTutorialLoading(false);
        setShowTutorial(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let accumulated = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              accumulated += content;
              setTutorialContent(accumulated);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              accumulated += content;
              setTutorialContent(accumulated);
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      console.error("Tutorial error:", err);
      toast.error("Something went wrong generating the tutorial.");
      setShowTutorial(false);
    } finally {
      setIsTutorialLoading(false);
    }
  };

  const generateAlternatives = async () => {
    if (alternatives.length > 0) {
      setShowAlternatives(!showAlternatives);
      return;
    }

    setShowAlternatives(true);
    setIsAlternativesLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-alternatives", {
        body: {
          recipeName: recipe.name,
          description: recipe.description,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          nutrition: recipe.nutrition,
          tips: recipe.tips,
        },
      });

      if (error) {
        console.error("Alternatives error:", error);
        toast.error("Failed to generate alternatives. Please try again.");
        setShowAlternatives(false);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        setShowAlternatives(false);
        return;
      }

      setAlternatives(data.alternatives || []);
    } catch (err) {
      console.error("Alternatives error:", err);
      toast.error("Something went wrong. Please try again.");
      setShowAlternatives(false);
    } finally {
      setIsAlternativesLoading(false);
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

        {/* Cooking Tutorial Button */}
        <Button
          onClick={generateTutorial}
          variant="outline"
          className="w-full gap-2 border-primary/30 hover:bg-primary/10"
          disabled={isTutorialLoading}
        >
          {isTutorialLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Tutorial...
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4 text-primary" />
              {tutorialContent ? (showTutorial ? "Hide Cooking Tutorial" : "Show Cooking Tutorial") : "Generate Cooking Tutorial"}
            </>
          )}
        </Button>

        {/* Tutorial Content */}
        {showTutorial && (tutorialContent || isTutorialLoading) && (
          <section className="rounded-xl border border-primary/30 bg-card p-6 space-y-3 animate-in fade-in-0 slide-in-from-top-2 duration-300">
            {tutorialContent ? (
              <div className="prose prose-sm prose-invert max-w-none [&_h1]:font-display [&_h1]:text-xl [&_h1]:text-foreground [&_h2]:font-display [&_h2]:text-lg [&_h2]:text-foreground [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:font-display [&_h3]:text-base [&_h3]:text-foreground [&_p]:text-foreground/80 [&_p]:text-sm [&_p]:leading-relaxed [&_li]:text-foreground/80 [&_li]:text-sm [&_strong]:text-primary [&_ul]:space-y-1 [&_ol]:space-y-1">
                <ReactMarkdown>{tutorialContent}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
          </section>
        )}

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

        {/* Diet & Allergy Alternatives */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <h3 className="text-lg font-display font-semibold text-foreground whitespace-nowrap flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Diet & Allergy Alternatives
            </h3>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            onClick={generateAlternatives}
            variant="outline"
            className="w-full gap-2 border-primary/30 hover:bg-primary/10"
            disabled={isAlternativesLoading}
          >
            {isAlternativesLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Alternatives...
              </>
            ) : (
              <>
                <Wheat className="w-4 h-4 text-primary" />
                {alternatives.length > 0
                  ? showAlternatives ? "Hide Alternatives" : "Show Alternatives"
                  : "Generate Diet & Allergy Alternatives"}
              </>
            )}
          </Button>

          {showAlternatives && isAlternativesLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {showAlternatives && alternatives.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4 animate-in fade-in-0 slide-in-from-top-2 duration-300">
              {alternatives.map((alt, i) => {
                const dietIcons: Record<string, string> = {
                  "Gluten-Free": "🌾",
                  "Dairy-Free": "🥛",
                  "Nut-Free": "🥜",
                  "Vegan": "🌱",
                  "Halal": "☪️",
                  "Kosher": "✡️",
                };
                const icon = dietIcons[alt.dietLabel] || "🍽️";

                return (
                  <div
                    key={i}
                    className="rounded-xl border bg-card p-4 space-y-3 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-lg mr-1.5">{icon}</span>
                        <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">
                          {alt.dietLabel}
                        </span>
                      </div>
                    </div>
                    <h4 className="font-display font-semibold text-foreground text-sm">{alt.name}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{alt.description}</p>

                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Key Swaps</p>
                      {alt.keySwaps.map((swap, j) => (
                        <p key={j} className="text-xs text-foreground/80 flex items-start gap-1.5">
                          <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          {swap}
                        </p>
                      ))}
                    </div>

                    <div className="flex gap-3 pt-1 border-t border-border text-[10px] text-muted-foreground">
                      <span><Flame className="w-3 h-3 text-primary inline mr-0.5" />{alt.nutrition.calories} kcal</span>
                      <span>{alt.nutrition.protein} protein</span>
                      <span>{alt.nutrition.carbs} carbs</span>
                      <span>{alt.nutrition.fat} fat</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

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
