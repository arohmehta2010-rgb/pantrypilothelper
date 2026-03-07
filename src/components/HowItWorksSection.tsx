import { Camera, ShoppingCart, PackageCheck } from "lucide-react";

const steps = [
  {
    num: 1,
    icon: Camera,
    title: "Image Submission & Recognition",
    bullets: [
      "Take a photo of your pantry or fridge",
      "Upload photo to the app/website",
      "Our AI system scans the photo",
      "It identifies ingredients, quantities, expiration dates",
    ],
    detail: "Detected Items: Pasta, Tomato Sauce, Beans, Rice",
  },
  {
    num: 2,
    icon: ShoppingCart,
    title: "Personalized Cart Generation",
    bullets: [
      "Enter dietary preferences (Gluten free, keto, more fiber, etc.)",
      "Enter grocery suggestions (more vegetables, milk, etc.)",
      "Generate grocery cart",
    ],
    detail: "Your Curated Cart: Fresh Vegetables, Chicken Breast, Olive Oil, Spices",
  },
  {
    num: 3,
    icon: PackageCheck,
    title: "Shopping & Order Integration",
    bullets: [
      "Review and edit cart",
      "Place order",
      "Update pantry inventory",
    ],
    detail: "Order Delivered! Recipe unlocked",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground text-center mb-12">
          How It Works
        </h2>

        <div className="space-y-8">
          {steps.map(({ num, icon: Icon, title, bullets, detail }) => (
            <div
              key={num}
              className="rounded-3xl border-2 border-border bg-secondary/40 p-8 sm:p-10 grid md:grid-cols-[1fr_auto] gap-8 items-start"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                    {num}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-semibold text-foreground">{title}</h3>
                </div>
                <ul className="space-y-2 ml-1">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-muted-foreground">
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-card border p-5 shadow-sm flex flex-col items-center gap-3 min-w-[200px]">
                <Icon className="w-10 h-10 text-primary" />
                <p className="text-sm text-center text-muted-foreground font-medium">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
