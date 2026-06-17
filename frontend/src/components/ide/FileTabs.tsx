import { X, FileCode, FileJson, FileText, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
      <div className="h-9 bg-[#252526] border-b border-[#1e1e1e] flex items-center px-4">
        <span className="text-xs text-muted-foreground">No open files</span>
      </div>
    );
  }

  return (
    <div className="h-9 bg-[#252526] flex items-center overflow-x-auto border-b border-[#1e1e1e]">
      <ScrollArea className="flex-1 h-full">
        <div className="flex h-full">
          {openFiles.map((file) => {
            const FileIcon = getFileIcon(file);
            const isActive = file === activeFile;

            return (
              <div
                key={file}
                className={cn(
                  "flex items-center gap-2 px-3 h-full min-w-[120px] max-w-[200px] cursor-pointer border-r border-[#1e1e1e] group",
                  isActive
                    ? "bg-[#1e1e1e] text-white"
                    : "bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2d2d]"
                )}
                onClick={() => onFileSelect(file)}
              >
                <FileIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs truncate flex-1">{getFileName(file)}</span>
                <button
                  className={cn(
                    "w-4 h-4 flex items-center justify-center rounded hover:bg-[#3c3c3c]",
                    isActive ? "text-white" : "text-[#969696]"
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
        <ScrollBar orientation="horizontal" className="h-1" />
      </ScrollArea>
    </div>
  );
};

export default FileTabs;
