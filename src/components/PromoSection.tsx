import { UtensilsCrossed, Truck, Clock } from "lucide-react";

const PromoSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto rounded-3xl border-2 border-border bg-secondary/40 p-8 sm:p-14">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Promo poster */}
          <div className="rounded-2xl bg-accent/30 p-8 text-center space-y-4 border border-accent">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground leading-tight">
              No Time, No Kitchen?<br />No Problem!
            </h2>
            <p className="text-xl font-semibold text-highlight">We've Got You!</p>
            <ul className="text-muted-foreground space-y-1 font-body text-base">
              <li>Fresh, home-style meals</li>
              <li>Weekly / Monthly packages</li>
              <li>Delivered to your doorstep, always on time</li>
            </ul>
            <div className="pt-4">
              <p className="text-2xl font-display font-bold text-foreground">PantryPilot</p>
              <p className="text-highlight font-semibold text-sm tracking-wide">simple / fast / healthy</p>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="space-y-6">
            <h3 className="text-2xl font-display font-semibold text-foreground">Why PantryPilot?</h3>
            {[
              { icon: UtensilsCrossed, title: "Fresh Home-Style Meals", desc: "Curated recipes from real kitchens, made with love." },
              { icon: Clock, title: "Flexible Packages", desc: "Choose weekly or monthly plans that fit your schedule." },
              { icon: Truck, title: "Always On Time", desc: "Reliable delivery right to your doorstep." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 items-start">
                <div className="rounded-xl bg-primary p-3 text-primary-foreground shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{title}</h4>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
