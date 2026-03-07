import { cn } from "@/lib/utils";

interface NavbarProps {
  activeView: "home" | "ask" | "inbox";
  onViewChange: (view: "home" | "ask" | "inbox") => void;
}

const Navbar = ({ activeView, onViewChange }: NavbarProps) => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b bg-card">
      <button
        onClick={() => onViewChange("home")}
        className="text-xl font-display font-semibold text-foreground tracking-tight hover:opacity-80 transition"
      >
        PantryPilot
      </button>
      <div className="flex gap-1">
        {(["home", "ask", "inbox"] as const).map((view) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize",
              activeView === view
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {view === "ask" ? "Ask PantryPilot" : view}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
