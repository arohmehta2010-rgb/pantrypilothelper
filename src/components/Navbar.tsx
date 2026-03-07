import { cn } from "@/lib/utils";
import { ChefHat } from "lucide-react";

interface NavbarProps {
  onHomeClick: () => void;
  onGenerateClick: () => void;
}

const Navbar = ({ onHomeClick, onGenerateClick }: NavbarProps) => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b bg-card">
      <button
        onClick={onHomeClick}
        className="flex items-center gap-2 text-xl font-display font-semibold text-foreground tracking-tight hover:text-primary transition"
      >
        <ChefHat className="w-6 h-6 text-primary" />
        PantryPilot
      </button>
      <div className="flex gap-1">
        <button
          onClick={onHomeClick}
          className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:bg-muted"
        >
          Home
        </button>
        <button
          onClick={onGenerateClick}
          className="px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Generate Recipe
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
