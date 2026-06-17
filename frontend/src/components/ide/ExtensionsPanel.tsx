import { useState, useEffect } from "react";
import { Puzzle, Check, Download, Info, ShieldCheck, Zap, Code, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Extension {
  id: string;
  name: string;
  description: string;
  publisher: string;
  installed: boolean;
  category: string;
  version: string;
  icon: any;
}

const ExtensionsPanel = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [extensions, setExtensions] = useState<Extension[]>([
    {
      id: "code-linter",
      name: "ESLint Pro",
      description: "Real-time linting and code quality checks for JavaScript and TypeScript.",
      publisher: "System Admin",
      installed: true,
      category: "Linters",
      version: "2.4.1",
      icon: ShieldCheck,
    },
    {
      id: "ai-debugger",
      name: "Orbit AI Debugger",
      description: "Advanced AI-powered debugger that finds logical errors and suggests fixes.",
      publisher: "Orbit Core",
      installed: false,
      category: "AI Tools",
      version: "1.0.5",
      icon: Zap,
    },
    {
      id: "prettier",
      name: "Prettier - Formatter",
      description: "Opinionated code formatter. Supports multiple languages.",
      publisher: "Prettier",
      installed: true,
      category: "Formatters",
      version: "3.2.0",
      icon: Code,
    },
    {
      id: "gitlens-mini",
      name: "GitLens Mini",
      description: "Visualize code authorship and history right inside the editor.",
      publisher: "System Admin",
      installed: false,
      category: "Source Control",
      version: "0.9.1",
      icon: Puzzle,
    }
  ]);

  const toggleInstall = (id: string) => {
    setExtensions(prev => prev.map(ext => {
      if (ext.id === id) {
        const newState = !ext.installed;
        toast({
          title: newState ? "Extension Installed" : "Extension Uninstalled",
          description: `${ext.name} has been ${newState ? "added to" : "removed from"} your workspace.`,
        });
        return { ...ext, installed: newState };
      }
      return ext;
    }));
  };

  const filteredExtensions = extensions.filter(ext => 
    ext.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ext.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-ide-sidebar">
      <div className="p-4 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Puzzle className="w-4 h-4" />
          Extensions Marketplace
        </h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search extensions..."
            className="pl-9 h-9 text-xs bg-muted/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {filteredExtensions.map((ext) => (
            <div 
              key={ext.id}
              className="p-3 rounded-md hover:bg-muted/50 border border-transparent hover:border-border transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <ext.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-medium truncate">{ext.name}</h4>
                    <Badge variant={ext.installed ? "default" : "outline"} className="text-[10px] h-4">
                      {ext.installed ? "Installed" : "Available"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                    {ext.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-muted-foreground">v{ext.version} • {ext.publisher}</span>
                    <Button 
                      size="sm" 
                      variant={ext.installed ? "ghost" : "default"}
                      className={cn(
                        "h-7 text-[10px] px-3",
                        ext.installed ? "text-destructive hover:bg-destructive/10" : "bg-primary hover:bg-primary/90"
                      )}
                      onClick={() => toggleInstall(ext.id)}
                    >
                      {ext.installed ? "Uninstall" : "Install"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredExtensions.length === 0 && (
            <div className="text-center py-10">
              <Puzzle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No extensions found</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-muted/20 border-t border-border">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Info className="w-3 h-3" />
          <span>Need a specific extension? Contact admin.</span>
        </div>
      </div>
    </div>
  );
};

export default ExtensionsPanel;
