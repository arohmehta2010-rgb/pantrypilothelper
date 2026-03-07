import { Truck } from "lucide-react";

const DeliverySection = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto rounded-3xl border-2 border-border bg-secondary/40 p-8 sm:p-14 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground mb-4">
            Delivery
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            We use a delivery service of your convenience to deliver the food to you, whether it is UPS, FedEx, UberEats, DoorDash, etc.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="rounded-full bg-secondary p-10">
            <Truck className="w-24 h-24 text-primary" strokeWidth={1.2} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliverySection;
