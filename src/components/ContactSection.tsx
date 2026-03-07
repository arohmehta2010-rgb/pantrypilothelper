import { Phone, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactSectionProps {
  onAskClick: () => void;
}

const ContactSection = ({ onAskClick }: ContactSectionProps) => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto rounded-3xl border-2 border-border bg-accent/30 p-8 sm:p-14 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground">
          Get In Touch
        </h2>
        <div className="flex flex-wrap justify-center gap-6 text-foreground font-medium">
          <span className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-highlight" />
            +123 456 7890
          </span>
          <span className="flex items-center gap-2">
            <AtSign className="w-5 h-5 text-highlight" />
            @pantrypilot
          </span>
        </div>
        <Button size="lg" onClick={onAskClick} className="text-base font-semibold">
          Ask PantryPilot
        </Button>
      </div>
    </section>
  );
};

export default ContactSection;
