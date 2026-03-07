import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: Date;
}

interface SubmitViewProps {
  onSubmit: (msg: Message) => void;
}

const subjects = ["Franchise Inquiry", "Feedback", "Support", "Partnership", "General"];

const SubmitView = ({ onSubmit }: SubmitViewProps) => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg: Message = {
      id: crypto.randomUUID(),
      ...form,
      timestamp: new Date(),
    };
    onSubmit(msg);
    setForm({ name: "", email: "", subject: "", message: "" });
    toast.success("Message sent! Shaila & Aroh will receive it shortly.");
  };

  return (
    <section className="w-full max-w-xl mx-auto">
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight mb-3">
          Send a message to <span className="text-highlight">Shaila & Aroh</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Submit inquiries, feedback, or franchise interest. Your input helps shape PantryPilot.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-foreground">Your Name</label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter your full name"
            className="w-full rounded-lg border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            className="w-full rounded-lg border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="subject" className="text-sm font-medium text-foreground">Subject</label>
          <select
            id="subject"
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full rounded-lg border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition appearance-none"
          >
            <option value="">Select a topic</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="message" className="text-sm font-medium text-foreground">Message</label>
          <textarea
            id="message"
            rows={5}
            required
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Share your thoughts..."
            className="w-full rounded-lg border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition resize-none"
          />
        </div>

        <Button type="submit" size="lg" className="w-full text-base font-semibold">
          Send to Shaila & Aroh
        </Button>
      </form>
    </section>
  );
};

export default SubmitView;
