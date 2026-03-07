import { cn } from "@/lib/utils";

interface NavbarProps {
  activeView: "submit" | "inbox";
  onViewChange: (view: "submit" | "inbox") => void;
}

const Navbar = ({ activeView, onViewChange }: NavbarProps) => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b bg-card">
      <a href="#" className="text-xl font-display font-semibold text-foreground tracking-tight">
        PantryPilot
      </a>
      <div className="flex gap-1">
        {(["submit", "inbox"] as const).map((view) => (
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
            {view}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
