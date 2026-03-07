import { useState } from "react";
import Navbar from "@/components/Navbar";
import SubmitView from "@/components/SubmitView";
import InboxView from "@/components/InboxView";
import type { Message } from "@/components/SubmitView";

const Index = () => {
  const [activeView, setActiveView] = useState<"submit" | "inbox">("submit");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = (msg: Message) => {
    setMessages((prev) => [msg, ...prev]);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 px-4 py-12 sm:px-6">
        {activeView === "submit" ? (
          <SubmitView onSubmit={handleSubmit} />
        ) : (
          <InboxView messages={messages} />
        )}
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        PantryPilot — Simplify your pantry, simplify your life.
      </footer>
    </div>
  );
};

export default Index;
