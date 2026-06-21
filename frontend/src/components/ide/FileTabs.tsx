import { X, FileCode, FileJson, FileText, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileTabsProps {
  openFiles: string[];
  activeFile: string | null;
  onFileSelect: (path: string) => void;
  onFileClose: (path: string) => void;
}

const getFileIcon = (path: string) => {
  if (!path) return File;
  if (path.endsWith(".ts") || path.endsWith(".tsx")) return FileCode;
  if (path.endsWith(".js") || path.endsWith(".jsx")) return FileCode;
  if (path.endsWith(".json")) return FileJson;
  if (path.endsWith(".md")) return FileText;
  if (path.endsWith(".css")) return FileCode;
  if (path.endsWith(".html")) return FileCode;
  return File;
};

const getFileName = (path: string) => {
  if (!path) return "Untitled";
  const parts = path.split("/");
  return parts[parts.length - 1];
};

const FileTabs = ({ openFiles, activeFile, onFileSelect, onFileClose }: FileTabsProps) => {
  if (openFiles.length === 0) {
    return (
      <div className="h-10 bg-background border-b border-border flex items-center px-4">
        <span className="text-xs text-muted-foreground">No open files</span>
      </div>
    );
  }

  return (
    <div className="h-10 bg-background flex items-center border-b border-border overflow-x-auto">
      <div className="flex h-full">
        {openFiles.map((file) => {
          const FileIcon = getFileIcon(file);
          const isActive = file === activeFile;

          return (
            <div
              key={file}
              className={cn(
                "flex items-center gap-2 px-3 h-full min-w-[120px] max-w-[200px] cursor-pointer border-r border-border group",
                isActive
                  ? "bg-background text-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              )}
              onClick={() => onFileSelect(file)}
            >
              <FileIcon className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs truncate flex-1">{getFileName(file)}</span>
              <button
                className={cn(
                  "w-5 h-5 flex items-center justify-center rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onFileClose(file);
                }}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileTabs;
