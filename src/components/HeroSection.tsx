import pantryPilotLogo from "@/assets/pantrypilot-logo.jpg";

const HeroSection = () => {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Rounded border frame like the slideshow */}
      <div className="max-w-4xl mx-auto rounded-3xl border-2 border-border bg-secondary/40 p-8 sm:p-14 text-center">
        <div className="flex justify-center mb-6">
          <img
            src={pantryPilotLogo}
            alt="PantryPilot — Meal Delivery Subscription"
            className="w-56 h-56 sm:w-72 sm:h-72 object-contain rounded-2xl shadow-lg bg-card"
          />
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-semibold tracking-tight text-foreground mb-3">
          Meal Delivery Subscription
        </h1>
        <p className="text-lg text-muted-foreground font-body">
          By: Shaila V and Aroh M
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
