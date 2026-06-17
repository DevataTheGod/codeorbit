import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbsProps {
  path: string;
  onNavigate?: (path: string) => void;
}

const Breadcrumbs = ({ path, onNavigate }: BreadcrumbsProps) => {
  if (!path) return null;

  const parts = path.split("/").filter(Boolean);

  const handleClick = (index: number) => {
    if (!onNavigate) return;
    const newPath = "/" + parts.slice(0, index + 1).join("/");
    onNavigate(newPath);
  };

  return (
    <div className="h-7 bg-[#252526] border-b border-[#1e1e1e] flex items-center px-3 text-xs text-[#969696]">
      {/* Root/Home */}
      <button
        className="flex items-center gap-1 hover:text-white transition-colors"
        onClick={() => onNavigate?.("/")}
      >
        <Home className="w-3.5 h-3.5" />
      </button>

      {parts.map((part, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="w-3.5 h-3.5 mx-1 text-[#5a5a5a]" />
          <button
            className={cn(
              "hover:text-white transition-colors",
              index === parts.length - 1 && "text-white"
            )}
            onClick={() => handleClick(index)}
          >
            {part}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Breadcrumbs;
