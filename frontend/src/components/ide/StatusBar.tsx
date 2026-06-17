import { GitBranch, Circle, FileCode, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBarProps {
  language?: string;
  line?: number;
  column?: number;
  branch?: string;
  hasErrors?: boolean;
  hasWarnings?: boolean;
  userPlan?: string;
  onSubmitClick?: () => void;
}

const StatusBar = ({ 
  language = "TypeScript", 
  line = 1, 
  column = 1, 
  branch = "main",
  hasErrors = false,
  hasWarnings = false,
  userPlan = "free",
  onSubmitClick
}: StatusBarProps) => {
  return (
    <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-xs">
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Branch */}
        <div className="flex items-center gap-1 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer">
          <GitBranch className="w-3.5 h-3.5" />
          <span>{branch}</span>
        </div>

        {/* Sync status */}
        <div className="flex items-center gap-1 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer">
          {hasErrors ? (
            <AlertCircle className="w-3.5 h-3.5 text-red-300" />
          ) : hasWarnings ? (
            <AlertCircle className="w-3.5 h-3.5 text-yellow-300" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5" />
          )}
          <span>{hasErrors ? "0" : hasWarnings ? "0" : "0"} problems</span>
        </div>

        {/* Submit Button */}
        {onSubmitClick && (
          <button 
            onClick={onSubmitClick}
            className="flex items-center gap-1.5 bg-accent/20 hover:bg-accent/40 px-3 py-0.5 rounded transition-colors text-accent-foreground border border-accent/30 font-bold ml-4"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>SUBMIT FOR REVIEW</span>
          </button>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Language */}
        <div className="flex items-center gap-1 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer">
          <FileCode className="w-3.5 h-3.5" />
          <span>{language}</span>
        </div>

        {/* Line/Column */}
        <div className="flex items-center gap-1 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer">
          <span>Ln {line}, Col {column}</span>
        </div>

        {/* Encoding */}
        <div className="flex items-center gap-1 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer">
          <span>UTF-8</span>
        </div>

        {/* Indentation */}
        <div className="flex items-center gap-1 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer">
          <span>Spaces: 2</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
