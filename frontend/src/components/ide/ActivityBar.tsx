import { 
  Files, 
  Search, 
  GitBranch, 
  Puzzle, 
  Settings, 
  Home,
  Bot,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const ActivityBar = ({ activeView, onViewChange }: ActivityBarProps) => {
  const navigate = useNavigate();

  const views = [
    { id: "explorer", icon: Files, label: "Explorer", shortcut: "Ctrl+Shift+E" },
    { id: "search", icon: Search, label: "Search", shortcut: "Ctrl+Shift+F" },
    { id: "git", icon: GitBranch, label: "Source Control", shortcut: "Ctrl+Shift+G" },
    { id: "extensions", icon: Puzzle, label: "Extensions", shortcut: "Ctrl+Shift+X" },
  ];

  const bottomViews = [
    { id: "ai", icon: Bot, label: "AI Assistant" },
    { id: "settings", icon: Settings, label: "Settings", shortcut: "," },
  ];

  return (
    <div className="w-12 h-full bg-[#333333] flex flex-col items-center py-2 border-r border-[#252526]">
      {/* Top section - View icons */}
      <div className="flex flex-col gap-1">
        {views.map((view) => (
          <Button
            key={view.id}
            variant="ghost"
            size="icon"
            className={cn(
              "w-10 h-10 rounded-md transition-colors",
              activeView === view.id 
                ? "bg-[#37373d] text-white" 
                : "text-[#858585] hover:bg-[#2a2d2e] hover:text-white"
            )}
            onClick={() => onViewChange(view.id)}
            title={`${view.label} (${view.shortcut})`}
          >
            <view.icon className="w-5 h-5" />
          </Button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom section */}
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-md text-[#858585] hover:bg-[#2a2d2e] hover:text-white transition-colors"
          onClick={() => navigate("/dashboard")}
          title="Return to Dashboard"
        >
          <Home className="w-5 h-5" />
        </Button>
        {bottomViews.map((view) => (
          <Button
            key={view.id}
            variant="ghost"
            size="icon"
            className={cn(
              "w-10 h-10 rounded-md transition-colors",
              activeView === view.id 
                ? "bg-[#37373d] text-white" 
                : "text-[#858585] hover:bg-[#2a2d2e] hover:text-white"
            )}
            onClick={() => onViewChange(view.id)}
            title={`${view.label} (${view.shortcut})`}
          >
            <view.icon className="w-5 h-5" />
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ActivityBar;
