const PricingSection = () => {
  const pills = [
    { label: "Monthly Subscription", value: "$55" },
    { label: "Single Meal", value: "$10.99" },
    { label: "Double Meal", value: "$21.99" },
    { label: "Standard Shipping (2-3 hrs)", value: "Free" },
    { label: "Express Shipping (1-2 hrs)", value: "$7.99" },
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto rounded-3xl border-2 border-border bg-secondary/40 p-8 sm:p-14">
        <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground mb-10">
          Products / Pricing
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {pills.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-full bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between text-sm sm:text-base font-medium"
            >
              <span>{label}</span>
              <span className="font-bold text-lg">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
