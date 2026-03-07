import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import RecipeGenerator from "@/components/RecipeGenerator";
import RecipeResult from "@/components/RecipeResult";
import type { Recipe } from "@/lib/types";

const Index = () => {
  const [view, setView] = useState<"home" | "generate" | "result">("home");
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  const handleRecipeGenerated = (r: Recipe) => {
    setRecipe(r);
    setView("result");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onHomeClick={() => setView("home")} onGenerateClick={() => setView("generate")} />

      {view === "home" && (
        <main className="flex-1">
          <HeroSection onGetStarted={() => setView("generate")} />
        </main>
      )}

      {view === "generate" && (
        <main className="flex-1 px-4 py-10 sm:px-6">
          <RecipeGenerator onRecipeGenerated={handleRecipeGenerated} />
        </main>
      )}

      {view === "result" && recipe && (
        <main className="flex-1 px-4 py-10 sm:px-6">
          <RecipeResult recipe={recipe} onBack={() => setView("generate")} />
        </main>
      )}

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        PantryPilot — simple / fast / healthy
      </footer>
    </div>
  );
};

export default Index;
