import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectFiles } from "@/hooks/useProjectFiles";

interface TerminalLine {
  type: "input" | "output" | "error" | "success" | "info";
  content: string;
  timestamp: Date;
}

interface TerminalProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const Terminal = ({ isExpanded, onToggle }: TerminalProps) => {
  const fs = useProjectFiles();
  const [cwd, setCwd] = useState("/src");
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "info", content: "CodeOrbit Terminal v2.0", timestamp: new Date() },
    { type: "info", content: "Type 'help' for available commands", timestamp: new Date() },
    { type: "output", content: "", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const resolvePath = (rawPath: string) => {
    if (!rawPath || rawPath === ".") return cwd;
    if (rawPath.startsWith("/")) return rawPath;
    if (rawPath === "..") {
      const parts = cwd.split("/").filter(Boolean);
      parts.pop();
      return "/" + parts.join("/");
    }
    return `${cwd.replace(/\/+$/, "")}/${rawPath}`;
  };

  const addLine = (type: TerminalLine["type"], content: string) => {
    setLines((prev) => [...prev, { type, content, timestamp: new Date() }]);
  };

  const runCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addLine("input", `${cwd} $ ${trimmed}`);

    const [command, ...args] = trimmed.split(/\s+/);

    try {
      switch (command) {
        case "help": {
          addLine(
            "output",
            [
              "Commands:",
              "  help               Show help",
              "  clear              Clear terminal",
              "  pwd                Print current directory",
              "  ls [path]          List entries",
              "  tree [path]        Show folder tree (flat listing)",
              "  cd <path>          Change directory",
              "  cat <file>         Print file content",
              "  touch <file>       Create empty file",
              "  mkdir <folder>     Create folder",
              "  rm <path>          Delete file",
              "  rm -r <folder>     Delete folder recursively",
              "  mv <old> <new>     Rename file/folder",
              "  edit <file>        Select file in editor",
              "  stats              Show project stats",
            ].join("\n")
          );
          break;
        }
        case "clear": {
          setLines([]);
          break;
        }
        case "pwd": {
          addLine("output", cwd);
          break;
        }
        case "ls": {
          const target = resolvePath(args[0] || ".");
          const nodes = fs.listDirectory(target);
          if (!nodes.length) {
            addLine("info", "(empty)");
          } else {
            addLine(
              "output",
              nodes
                .map((n) => `${n.type === "folder" ? "d" : "f"}  ${n.name}`)
                .join("\n")
            );
          }
          break;
        }
        case "tree": {
          const target = resolvePath(args[0] || ".");
          const all = Object.keys(fs.files)
            .filter((p) => p === target || p.startsWith(target.endsWith("/") ? target : `${target}/`))
            .sort();
          addLine("output", all.length ? all.join("\n") : "(empty)");
          break;
        }
        case "cd": {
          const target = resolvePath(args[0] || "/");
          const node = fs.files[target];
          if (!node || node.type !== "folder") {
            addLine("error", `Not a directory: ${target}`);
          } else {
            setCwd(target);
            addLine("success", `Changed directory to ${target}`);
          }
          break;
        }
        case "cat": {
          const target = resolvePath(args[0] || "");
          const node = fs.files[target];
          if (!node || node.type !== "file") {
            addLine("error", `File not found: ${target}`);
          } else {
            addLine("output", node.content || "");
          }
          break;
        }
        case "touch": {
          const target = resolvePath(args[0] || "");
          if (!target) {
            addLine("error", "Usage: touch <file>");
            break;
          }
          fs.createNode(target, "file", "", "text");
          addLine("success", `Created file: ${target}`);
          break;
        }
        case "mkdir": {
          const target = resolvePath(args[0] || "");
          if (!target) {
            addLine("error", "Usage: mkdir <folder>");
            break;
          }
          fs.createNode(target, "folder");
          addLine("success", `Created folder: ${target}`);
          break;
        }
        case "rm": {
          const recursive = args[0] === "-r" || args[0] === "-rf";
          const target = resolvePath(recursive ? args[1] || "" : args[0] || "");
          if (!target) {
            addLine("error", "Usage: rm <path> | rm -r <folder>");
            break;
          }
          fs.deleteNode(target, recursive);
          addLine("success", `Deleted: ${target}`);
          break;
        }
        case "mv": {
          if (args.length < 2) {
            addLine("error", "Usage: mv <oldPath> <newName>");
            break;
          }
          const from = resolvePath(args[0]);
          const toName = args[1];
          fs.renameNode(from, toName);
          addLine("success", `Renamed: ${from} -> ${toName}`);
          break;
        }
        case "edit": {
          const target = resolvePath(args[0] || "");
          const node = fs.files[target];
          if (!node || node.type !== "file") {
            addLine("error", `File not found: ${target}`);
          } else {
            fs.selectFile(target);
            addLine("success", `Opened file: ${target}`);
          }
          break;
        }
        case "stats": {
          const s = fs.getStats();
          addLine("output", `Files: ${s.totalFiles}\nFolders: ${s.totalFolders}\nSize: ${(s.totalSize / 1024).toFixed(2)} KB`);
          break;
        }
        default: {
          addLine("error", `Command not found: ${command}`);
          break;
        }
      }
    } catch (err) {
      addLine("error", String(err));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      runCommand(input);
      setInput("");
    }
  };

  const getLineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "error":
        return "text-ide-error";
      case "success":
        return "text-ide-success";
      case "info":
        return "text-ide-info";
      case "input":
        return "text-primary";
      default:
        return "text-foreground";
    }
  };

  return (
    <div
      className={cn(
        "bg-ide-terminal border-t border-border transition-all duration-300",
        isExpanded ? "h-64" : "h-10"
      )}
    >
      <div
        className="h-10 flex items-center justify-between px-4 cursor-pointer border-b border-border"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <Minimize2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          ) : (
            <Maximize2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div
          className="h-[calc(100%-40px)] font-mono text-sm p-4 overflow-auto"
          ref={scrollRef}
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line, index) => (
            <div key={index} className={cn("leading-relaxed whitespace-pre-wrap", getLineColor(line.type))}>
              {line.content}
            </div>
          ))}
          <div className="flex items-center">
            <span className="text-primary mr-2">{cwd} $</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-foreground"
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Terminal;
