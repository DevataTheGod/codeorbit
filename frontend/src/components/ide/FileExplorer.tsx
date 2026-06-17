import { useMemo, useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Trash2, CheckSquare, Square, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProjectFiles } from "@/hooks/useProjectFiles";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface FileExplorerProps {
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
}

const TreeNode = ({
  node,
  depth,
  onFileSelect,
  selectedFile,
  selectedPaths,
  setSelectedPaths,
}: any) => {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const isFolder = node.type === "folder";
  const isSelected = selectedFile === node.path;

  const toggleNodeSelection = (path: string, checked: boolean) => {
    setSelectedPaths((prev: Set<string>) => {
      const next = new Set(prev);
      if (checked) {
        next.add(path);
      } else {
        next.delete(path);
      }
      return next;
    });
  };

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(node.path);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 py-1 px-2 cursor-pointer text-sm transition-colors",
          "hover:bg-muted/50 rounded-sm",
          isSelected && "bg-primary/20 text-primary"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <button
          className="mr-1 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            toggleNodeSelection(node.path, !selectedPaths.has(node.path));
          }}
          title={selectedPaths.has(node.path) ? "Unselect" : "Select"}
        >
          {selectedPaths.has(node.path) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-1 flex-1" onClick={handleClick}>
          {isFolder ? (
            <>
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              {isOpen ? (
                <FolderOpen className="w-4 h-4 text-ide-folder" />
              ) : (
                <Folder className="w-4 h-4 text-ide-folder" />
              )}
            </>
          ) : (
            <>
              <span className="w-4" />
              <File className="w-4 h-4 text-ide-file" />
            </>
          )}
          <span className="truncate">{node.name}</span>
        </div>
      </div>
      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((child: any) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
              selectedPaths={selectedPaths}
              setSelectedPaths={setSelectedPaths}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer = ({ onFileSelect, selectedFile }: FileExplorerProps) => {
  const fs = useProjectFiles();
  const { toast } = useToast();
  const navigate = useNavigate();
  const tree = fs.getFileTree();
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());

  const selectedCount = selectedPaths.size;

  const sortedSelection = useMemo(() => {
    // Delete deeper paths first so folder/file overlap doesn't cause errors.
    return Array.from(selectedPaths).sort((a, b) => b.length - a.length);
  }, [selectedPaths]);

  const handleDeleteSelected = () => {
    if (selectedCount === 0) {
      toast({ title: "No selection", description: "Select files/folders first." });
      return;
    }

    if (!confirm(`Delete ${selectedCount} selected item(s)?`)) return;

    let deleted = 0;
    let failed = 0;

    for (const path of sortedSelection) {
      try {
        const node = fs.files[path];
        if (!node) continue;
        if (node.type === "folder") {
          fs.deleteNode(path, true);
        } else {
          fs.deleteNode(path);
        }
        deleted += 1;
      } catch {
        failed += 1;
      }
    }

    setSelectedPaths(new Set());
    toast({
      title: "Delete completed",
      description: failed > 0 ? `Deleted ${deleted}, failed ${failed}` : `Deleted ${deleted} item(s).`,
      variant: failed > 0 ? "destructive" : "default",
    });
  };

  const handleSelectAllVisible = () => {
    const allPaths = new Set<string>();
    const walk = (nodes: any[]) => {
      nodes.forEach((n) => {
        allPaths.add(n.path);
        if (n.children?.length) walk(n.children);
      });
    };
    walk(tree as any[]);
    setSelectedPaths(allPaths);
  };

  return (
    <div className="h-full bg-ide-sidebar border-r border-border">
      <div className="p-3 border-b border-border flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Explorer</h3>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => navigate("/dashboard")}
            title="Return to Dashboard"
          >
            <Home className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={handleSelectAllVisible}
          >
            Select All
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-7 px-2 text-xs"
            onClick={handleDeleteSelected}
          >
            <Trash2 className="w-3 h-3 mr-1" /> Delete ({selectedCount})
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[calc(100%-48px)]">
        <div className="py-2">
          {tree.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              depth={0}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
              selectedPaths={selectedPaths}
              setSelectedPaths={setSelectedPaths}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FileExplorer;
