import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PromoSection from "@/components/PromoSection";
import PricingSection from "@/components/PricingSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import DeliverySection from "@/components/DeliverySection";
import ContactSection from "@/components/ContactSection";
import SubmitView from "@/components/SubmitView";
import InboxView from "@/components/InboxView";
import type { Message } from "@/components/SubmitView";

const Index = () => {
  const [activeView, setActiveView] = useState<"home" | "ask" | "inbox">("home");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = (msg: Message) => {
    setMessages((prev) => [msg, ...prev]);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar activeView={activeView} onViewChange={setActiveView} />

      {activeView === "home" && (
        <main className="flex-1">
          <HeroSection />
          <PromoSection />
          <PricingSection />
          <HowItWorksSection />
          <DeliverySection />
          <ContactSection onAskClick={() => setActiveView("ask")} />
        </main>
      )}

      {activeView === "ask" && (
        <main className="flex-1 px-4 py-12 sm:px-6">
          <SubmitView onSubmit={handleSubmit} />
        </main>
      )}

      {activeView === "inbox" && (
        <main className="flex-1 px-4 py-12 sm:px-6">
          <InboxView messages={messages} />
        </main>
      )}

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        PantryPilot — simple / fast / healthy
      </footer>
    </div>
  );
};

export default Index;
