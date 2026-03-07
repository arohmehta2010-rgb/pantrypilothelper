import type { Message } from "@/components/SubmitView";
import { format } from "date-fns";

interface InboxViewProps {
  messages: Message[];
}

const InboxView = ({ messages }: InboxViewProps) => {
  return (
    <section className="w-full max-w-2xl mx-auto">
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight mb-3">
          Inbox for <span className="text-highlight">Shaila & Aroh</span>
        </h1>
        <p className="text-muted-foreground text-lg">Messages submitted by users</p>
      </header>

      {messages.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{msg.name}</h3>
                  <p className="text-xs text-muted-foreground">{msg.email}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground whitespace-nowrap">
                  {msg.subject}
                </span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{msg.message}</p>
              <p className="text-xs text-muted-foreground mt-3">
                {format(msg.timestamp, "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default InboxView;
