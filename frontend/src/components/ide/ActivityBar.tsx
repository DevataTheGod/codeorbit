import { 
  Files, 
  Search, 
  GitBranch, 
  Settings, 
  Home,
  MessageSquare,
  Puzzle,
  FolderOpen
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
    { id: "explorer", icon: Files, label: "Explorer" },
    { id: "operations", icon: FolderOpen, label: "File Operations" },
    { id: "search", icon: Search, label: "Search" },
    { id: "git", icon: GitBranch, label: "Source Control" },
    { id: "extensions", icon: Puzzle, label: "Extensions" },
    { id: "chat", icon: MessageSquare, label: "Chat History" },
  ];

  return (
    <div className="w-12 h-full bg-background flex flex-col items-center py-2 border-r border-border shrink-0">
      {/* Logo */}
      <div className="mb-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">CO</span>
        </div>
      </div>

      {/* Top section - View icons */}
      <div className="flex flex-col gap-1">
        {views.map((view) => (
          <Button
            key={view.id}
            variant="ghost"
            size="icon"
            className={cn(
              "w-10 h-10 rounded-xl transition-all",
              activeView === view.id 
                ? "bg-muted text-foreground" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
            onClick={() => onViewChange(view.id)}
            title={view.label}
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
          className="w-10 h-10 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
          onClick={() => navigate("/dashboard")}
          title="Dashboard"
        >
          <Home className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "w-10 h-10 rounded-xl transition-all",
            activeView === "settings" 
              ? "bg-muted text-foreground" 
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
          onClick={() => onViewChange("settings")}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ActivityBar;
