import { useState, useEffect } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import FileExplorer from "./FileExplorer";
import CodeEditor from "./CodeEditor";
import Terminal from "./Terminal";
import AIChatPanel from "./AIChatPanel";
import FileOperationsPanel from "./FileOperationsPanel";
import ActivityBar from "./ActivityBar";
import FileTabs from "./FileTabs";
import StatusBar from "./StatusBar";
import Breadcrumbs from "./Breadcrumbs";
import { useProjectFiles, ProjectFilesProvider } from "@/hooks/useProjectFiles";
import { ConversationHistory } from "@/components/ConversationHistory";
import { GitBranch, Github, Search as SearchIcon, FileCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CodeExplanationModal } from "./CodeExplanationModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ExtensionsPanel from "./ExtensionsPanel";

const IDEWorkspaceContent = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { files, selectedFile, selectFile, updateNode, deleteNode } = useProjectFiles();
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(true);
  const [activeView, setActiveView] = useState("explorer");
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [cursorPos, setCursorPos] = useState({ line: 1, column: 1 });
  
  const currentFileNode = selectedFile ? files[selectedFile] : null;
  const code = currentFileNode?.content || "";

  // Synchronize open files tabs with selected file
  useEffect(() => {
    if (selectedFile && !openFiles.includes(selectedFile)) {
      setOpenFiles(prev => [...prev, selectedFile]);
    }
  }, [selectedFile, openFiles]);

  // Reset cursor position on file switch
  useEffect(() => {
    setCursorPos({ line: 1, column: 1 });
  }, [selectedFile]);

  const handleFileClose = (path: string) => {
    const remaining = openFiles.filter(f => f !== path);
    setOpenFiles(remaining);
    if (selectedFile === path) {
      if (remaining.length > 0) {
        selectFile(remaining[remaining.length - 1]);
      } else {
        selectFile(null);
      }
    }
  };

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("plan")
          .eq("user_id", user.id)
          .maybeSingle();
        if (data) setUserPlan(data.plan || "free");
      };
      fetchProfile();
    }
  }, [user]);

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined && selectedFile) {
      updateNode(selectedFile, value);
    }
  };

  const handleVerificationSuccess = () => {
    toast({
      title: "Proof of Work Verified",
      description: userPlan === "pro" 
        ? "AI verification passed. Your code is also being queued for Mentor review."
        : "You have successfully explained your code via AI assessment.",
    });
  };

  const handleVerificationFailure = () => {
    toast({
      title: "Verification Failed",
      description: "Code explanation was incorrect. Task has been flagged for reset.",
      variant: "destructive",
    });
  };

  const handleSubmitClick = () => {
    setIsVerificationOpen(true);
  };

  return (
    <div className="h-screen bg-ide-bg flex flex-col">
      {/* Main content area with Activity Bar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar (far left) */}
        <ActivityBar activeView={activeView} onViewChange={setActiveView} />

        {/* Resizable Panel Group */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Conversation History */}
          <ResizablePanel defaultSize={12} minSize={10} maxSize={20}>
            <ConversationHistory />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Sidebar Panels (Explorer, Search, Git, Extensions) */}
          <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
            <div className="flex flex-col h-full bg-ide-sidebar border-r border-border">
              {activeView === "explorer" && (
                <>
                  <FileExplorer onFileSelect={selectFile} selectedFile={selectedFile} />
                  <FileOperationsPanel />
                </>
              )}
              {activeView === "search" && (
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-border">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                       <SearchIcon className="w-4 h-4" />
                       Search Project
                    </h3>
                    <div className="relative">
                      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search files..."
                        className="pl-9 h-9 text-xs bg-muted/30"
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                    <SearchIcon className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-xs">Enter a search term to find code across your project</p>
                  </div>
                </div>
              )}
              {activeView === "git" && (
                <div className="flex flex-col h-full overflow-y-auto">
                  <div className="p-4 border-b border-border">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      Source Control
                    </h3>
                    <div className="space-y-4">
                      <div className="p-3 bg-muted/30 rounded border border-border">
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase">Current Repository</p>
                        <div className="text-xs font-mono truncate text-primary flex items-center gap-2">
                           <Github className="w-3 h-3" />
                           AnuragShivoham/codeorbit
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase text-muted-foreground">Changes</Label>
                        <div className="space-y-1">
                          {Object.keys(files).slice(0, 3).map(path => (
                            <div key={path} className="flex items-center justify-between p-1.5 rounded hover:bg-muted/50 text-[11px]">
                               <div className="flex items-center gap-2 truncate">
                                 <FileCode className="w-3 h-3 text-primary" />
                                 <span className="truncate">{path}</span>
                               </div>
                               <span className="text-[10px] text-yellow-500 font-bold ml-2">M</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                         <Button size="sm" className="w-full gap-2 text-xs h-8">
                            Commit & Sync
                         </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeView === "extensions" && <ExtensionsPanel />}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Editor + Terminal */}
          <ResizablePanel defaultSize={55}>
            <div className="h-full flex flex-col">
              <FileTabs 
                openFiles={openFiles} 
                activeFile={selectedFile} 
                onFileSelect={selectFile}
                onFileClose={handleFileClose}
              />
              
              <Breadcrumbs path={selectedFile || ""} />

              <div className="flex-1 min-h-0">
                 <CodeEditor
                  selectedFile={selectedFile}
                  code={code}
                  onChange={handleCodeChange}
                  onCursorChange={(line, col) => setCursorPos({ line, column: col })}
                />
              </div>
              
              <Terminal
                isExpanded={isTerminalExpanded}
                onToggle={() => setIsTerminalExpanded((v) => !v)}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* AI Chat Panel */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
            <AIChatPanel
              currentTask="Implement JWT Authentication"
              currentCode={code}
              currentFiles={files}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <StatusBar 
        language={selectedFile ? (selectedFile.endsWith(".json") ? "JSON" : selectedFile.endsWith(".md") ? "Markdown" : "TypeScript") : "Plain Text"}
        branch="main"
        line={cursorPos.line}
        column={cursorPos.column}
        userPlan={userPlan}
        onSubmitClick={handleSubmitClick}
      />

      <CodeExplanationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        onSuccess={handleVerificationSuccess}
        onFailure={handleVerificationFailure}
        codeSnippet={code.slice(0, 500)} // Pass first 500 chars for context
      />
    </div>
  );
};

const IDEWorkspace = () => {
  return (
    <ProjectFilesProvider>
      <IDEWorkspaceContent />
    </ProjectFilesProvider>
  );
};

export default IDEWorkspace;
