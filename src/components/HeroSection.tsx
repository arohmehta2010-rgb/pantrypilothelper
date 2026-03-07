import logoImage from "@/assets/eggplant-logo.png";
import { Button } from "@/components/ui/button";
import { ChefHat, Salad, Clock, DollarSign } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
  onBrowse?: () => void;
}

const features = [
  {
    icon: Salad,
    title: "Personalized Recipes",
    desc: "Tell us your diet, preferences, and what's in your kitchen. We do the rest.",
  },
  {
    icon: ChefHat,
    title: "Step-by-Step Instructions",
    desc: "Clear, easy-to-follow steps so anyone can cook like a pro.",
  },
  {
    icon: DollarSign,
    title: "Cost Estimates",
    desc: "Know exactly what each recipe will cost before you start.",
  },
  {
    icon: Clock,
    title: "Quick & Convenient",
    desc: "No more scrolling through endless blogs. Get recipes in seconds.",
  },
];

const HeroSection = ({ onGetStarted, onBrowse }: HeroSectionProps) => {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="flex justify-center mb-4">
            <img
              src={logoImage}
              alt="PantryPilot — Your Smart Meal Plan Helper"
              className="w-96 sm:w-[28rem] object-contain"
            />
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-semibold tracking-tight text-foreground leading-tight">
            Cook smarter with{" "}
            <span className="text-primary">what you have</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Enter your dietary needs, food preferences, and available ingredients — PantryPilot generates personalized recipes with full nutrition facts, steps, and cost estimates.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="text-base font-semibold px-10 py-6 text-lg"
            >
              Get Started — It's Free
            </Button>
            {onBrowse && (
              <Button
                size="lg"
                variant="outline"
                onClick={onBrowse}
                className="text-base font-semibold px-10 py-6 text-lg"
              >
                Browse Recipes
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-center text-foreground mb-10">
            Why PantryPilot?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border bg-card p-6 space-y-3 hover:border-primary/50 transition"
              >
                <div className="rounded-xl bg-accent p-3 w-fit">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-10">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-foreground">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Your Preferences", desc: "Select your diet and food preferences" },
              { step: "2", title: "Your Ingredients", desc: "Tell us what's in your pantry or fridge" },
              { step: "3", title: "Your Recipes", desc: "Get personalized recipes with full details" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="space-y-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {step}
                </span>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <Button onClick={onGetStarted} variant="outline" size="lg">
            Try It Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
