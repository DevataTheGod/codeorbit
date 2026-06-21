import { GitBranch, AlertCircle, CheckCircle } from "lucide-react";

interface StatusBarProps {
  language?: string;
  line?: number;
  column?: number;
  branch?: string;
  hasErrors?: boolean;
  hasWarnings?: boolean;
  onSubmitClick?: () => void;
  onBranchClick?: () => void;
  onFormatClick?: () => void;
}

const StatusBar = ({ 
  language = "TypeScript", 
  line = 1, 
  column = 1, 
  branch = "main",
  hasErrors = false,
  hasWarnings = false,
  onBranchClick,
  onFormatClick,
}: StatusBarProps) => {
  return (
    <div className="h-6 bg-background border-t border-border text-muted-foreground flex items-center justify-between px-3 text-[11px] shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <div 
          className="flex items-center gap-1.5 hover:bg-muted px-2 py-0.5 rounded cursor-pointer"
          onClick={onBranchClick}
        >
          <GitBranch className="w-3.5 h-3.5 text-green-500" />
          <span>{branch}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {hasErrors ? (
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          ) : hasWarnings ? (
            <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          )}
          <span>{hasErrors ? "1 problem" : hasWarnings ? "1 warning" : "0 problems"}</span>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <span>Ln {line}, Col {column}</span>
        <span>Spaces: 2</span>
        <span>UTF-8</span>
        <span>{language}</span>
        <div 
          className="flex items-center gap-1.5 text-green-500 hover:bg-muted px-2 py-0.5 rounded cursor-pointer"
          onClick={onFormatClick}
          title="Format Document (Prettier)"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Prettier</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
