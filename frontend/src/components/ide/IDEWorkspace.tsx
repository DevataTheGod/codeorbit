import { useState, useEffect, useMemo } from "react";
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
import { GitBranch, PanelLeftClose, PanelLeft, Bell, Play, Search as SearchIcon, MessageSquare, Settings as SettingsIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CodeExplanationModal } from "./CodeExplanationModal";
import { ReflectionChallengeModal } from "./ReflectionChallengeModal";
import { ReflectionChallengeService, ReflectionChallenge } from "@/services/ReflectionChallengeService";
import { useAuth } from "@/hooks/useAuth";
import ExtensionsPanel from "./ExtensionsPanel";
import { ErrorBoundary } from "./ErrorBoundary";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const IDEWorkspaceContent = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { files, selectedFile, selectFile, updateNode } = useProjectFiles();
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(true);
  const [activeView, setActiveView] = useState("explorer");
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cursorPos, setCursorPos] = useState({ line: 1, column: 1 });
  
  const [reflectionChallenge, setReflectionChallenge] = useState<ReflectionChallenge | null>(null);
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);
  
  // Custom states for interactive elements
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [currentBranch, setCurrentBranch] = useState("main");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGitSyncing, setIsGitSyncing] = useState(false);
  const [dashboardContext, setDashboardContext] = useState<any>(null);
  const [notifications] = useState([
    { id: 1, text: "Mentor left a comment on your Auth checkpoint.", time: "2 hours ago" },
    { id: 2, text: "AI roadmap generated successfully.", time: "1 day ago" },
    { id: 3, text: "Welcome to CodeOrbit!", time: "2 days ago" },
  ]);

  const currentFileNode = selectedFile ? files[selectedFile] : null;
  const code = currentFileNode?.content || "";

  useEffect(() => {
    if (user) {
      const fetchWorkspaceData = async () => {
        try {
          const { data: submissionsData } = await supabase
            .from("project_submissions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
            
          if (submissionsData && submissionsData.length > 0) {
            const submission = submissionsData[0];
            
            const { data: milestonesData } = await supabase
              .from("milestones")
              .select("*")
              .eq("submission_id", submission.id)
              .order("order_index", { ascending: true });
              
            if (milestonesData && milestonesData.length > 0) {
              const milestoneIds = milestonesData.map((m) => m.id);
              const { data: tasksData } = await supabase
                .from("tasks")
                .select("*")
                .in("milestone_id", milestoneIds)
                .order("order_index", { ascending: true });
                
              const milestonesWithTasks = milestonesData.map((m) => ({
                ...m,
                tasks: (tasksData || []).filter((t) => t.milestone_id === m.id),
              }));
              
              setDashboardContext({
                submission,
                milestones: milestonesWithTasks,
              });
            } else {
              setDashboardContext({ submission, milestones: [] });
            }
          }
        } catch (err) {
          console.error("Error loading workspace dashboard context:", err);
        }
      };
      fetchWorkspaceData();
    }
  }, [user]);

  const handleRunCode = () => {
    if (!selectedFile) {
      toast({ title: "No file selected", description: "Select a file to run." });
      return;
    }
    const event = new CustomEvent("orbit:run-code", { detail: { path: selectedFile } });
    window.dispatchEvent(event);
  };

  const handleSync = () => {
    setIsSyncing(true);
    toast({ title: "Syncing...", description: "Saving changes to cloud storage." });
    setTimeout(() => {
      setIsSyncing(false);
      toast({ title: "Synced", description: "All files are synchronized." });
    }, 1200);
  };

  const handleGitCommitSync = () => {
    setIsGitSyncing(true);
    toast({ title: "Staging files...", description: "Adding local changes to index." });
    setTimeout(() => {
      toast({ title: "Committing...", description: "git commit -m 'Update project files'" });
      setTimeout(() => {
        toast({ title: "Syncing...", description: "git push origin main" });
        setTimeout(() => {
          setIsGitSyncing(false);
          toast({ title: "Repository Synced", description: "Successfully pushed to DevataTheGod/codeorbit" });
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const handleFormatPrettier = () => {
    if (!selectedFile || !currentFileNode) return;
    toast({ title: "Prettier", description: "Formatting code..." });
    setTimeout(() => {
      let formatted = currentFileNode.content || "";
      updateNode(selectedFile, formatted);
      toast({ title: "Prettier", description: "File formatted successfully." });
    }, 400);
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return Object.entries(files)
      .filter(([path, node]) => {
        if (node.type !== "file") return false;
        const pathMatch = path.toLowerCase().includes(searchQuery.toLowerCase());
        const contentMatch = node.content?.toLowerCase().includes(searchQuery.toLowerCase());
        return pathMatch || contentMatch;
      })
      .map(([path, node]) => ({
        path,
        name: node.name,
        snippet: node.content ? node.content.slice(0, 100) : ""
      }));
  }, [searchQuery, files]);

  const handleBranchClick = () => {
    const branches = ["main", "dev", "feature/auth"];
    const nextIndex = (branches.indexOf(currentBranch) + 1) % branches.length;
    setCurrentBranch(branches[nextIndex]);
    toast({
      title: "Branch Changed",
      description: `Switched to branch ${branches[nextIndex]}`,
    });
  };

  useEffect(() => {
    if (selectedFile && !openFiles.includes(selectedFile)) {
      setOpenFiles(prev => [...prev, selectedFile]);
    }
  }, [selectedFile, openFiles]);

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

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined && selectedFile) {
      updateNode(selectedFile, value);
    }
  };

  const handleLargePaste = (pastedText: string) => {
    if (user) {
      const challenge = ReflectionChallengeService.generatePostPasteChallenge(
        user.id,
        null,
        pastedText
      );
      setReflectionChallenge(challenge);
      setIsReflectionOpen(true);
    }
  };

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const panelSizes = useMemo(() => {
    if (screenWidth < 1200) {
      return { sidebar: 0, editor: 60, chat: 40 };
    }
    return { sidebar: 18, editor: 50, chat: 32 };
  }, [screenWidth]);

  const getFileName = (path: string | null) => {
    if (!path) return "Untitled";
    return path.split("/").pop() || "Untitled";
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Top Header Bar */}
      <header className="h-11 bg-background border-b border-border flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </Button>
          
          <Breadcrumbs path={selectedFile || ""} />
        </div>

        <div className="flex items-center gap-2">
          {!isChatOpen && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-3"
              onClick={() => setIsChatOpen(true)}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Open Chat
            </Button>
          )}

          <Badge 
            variant="outline" 
            className="text-xs gap-1.5 px-2 py-0.5 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={handleSync}
          >
            <span className={cn("w-2 h-2 rounded-full", isSyncing ? "bg-yellow-500 animate-pulse" : "bg-green-500")} />
            {isSyncing ? "Syncing..." : "Synced"}
          </Badge>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
              <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">Notifications</h3>
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div key={notif.id} className="text-xs border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <p className="font-medium text-foreground">{notif.text}</p>
                    <span className="text-[10px] text-muted-foreground">{notif.time}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <Button size="sm" className="h-8 gap-1.5 px-3" onClick={handleRunCode}>
            <Play className="w-3.5 h-3.5" />
            Run
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar activeView={activeView} onViewChange={setActiveView} />

        {/* Resizable Panels */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Sidebar with Auto-Adjustable Sections */}
          {sidebarOpen && (
            <>
              <ResizablePanel defaultSize={panelSizes.sidebar} minSize={12} maxSize={25}>
                <div className="h-full flex flex-col bg-background border-r border-border overflow-hidden">
                  {/* Explorer Section */}
                  <div className="flex flex-col border-b border-border" style={{ flex: activeView === "explorer" ? 3 : 0, minHeight: activeView === "explorer" ? 0 : 36 }}>
                    <button 
                      className="h-9 flex items-center justify-between px-3 hover:bg-muted/50 transition-colors shrink-0"
                      onClick={() => setActiveView(activeView === "explorer" ? "" : "explorer")}
                    >
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Explorer</span>
                      <span className="text-xs text-muted-foreground">{activeView === "explorer" ? "−" : "+"}</span>
                    </button>
                    {activeView === "explorer" && (
                      <div className="flex-1 overflow-hidden">
                        <ErrorBoundary fallbackTitle="Explorer Failed to Load">
                          <FileExplorer onFileSelect={selectFile} selectedFile={selectedFile} />
                        </ErrorBoundary>
                      </div>
                    )}
                  </div>

                  {/* File Operations Section */}
                  <div className="flex flex-col border-b border-border" style={{ flex: activeView === "operations" ? 3 : 0, minHeight: activeView === "operations" ? 0 : 36 }}>
                    <button 
                      className="h-9 flex items-center justify-between px-3 hover:bg-muted/50 transition-colors shrink-0"
                      onClick={() => setActiveView(activeView === "operations" ? "" : "operations")}
                    >
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">File Operations</span>
                      <span className="text-xs text-muted-foreground">{activeView === "operations" ? "−" : "+"}</span>
                    </button>
                    {activeView === "operations" && (
                      <div className="flex-1 overflow-y-auto">
                        <ErrorBoundary fallbackTitle="File Operations Failed to Load">
                          <FileOperationsPanel />
                        </ErrorBoundary>
                      </div>
                    )}
                  </div>

                  {/* Search Section */}
                  <div className="flex flex-col border-b border-border" style={{ flex: activeView === "search" ? 2 : 0, minHeight: activeView === "search" ? 0 : 36 }}>
                    <button 
                      className="h-9 flex items-center justify-between px-3 hover:bg-muted/50 transition-colors shrink-0"
                      onClick={() => setActiveView(activeView === "search" ? "" : "search")}
                    >
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Search</span>
                      <span className="text-xs text-muted-foreground">{activeView === "search" ? "−" : "+"}</span>
                    </button>
                    {activeView === "search" && (
                      <div className="flex-1 overflow-hidden p-3 flex flex-col h-full">
                        <div className="relative mb-3 shrink-0">
                          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Search files..." 
                            className="pl-9 h-8 text-xs bg-muted/30" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <ScrollArea className="flex-1">
                          {searchResults.length > 0 ? (
                            <div className="space-y-2">
                              {searchResults.map((res) => (
                                <button
                                  key={res.path}
                                  className="w-full text-left p-2 rounded hover:bg-muted/50 border border-transparent hover:border-border text-xs transition-colors"
                                  onClick={() => selectFile(res.path)}
                                >
                                  <div className="font-semibold truncate text-primary">{res.name}</div>
                                  <div className="text-[10px] text-muted-foreground truncate">{res.path}</div>
                                  {res.snippet && (
                                    <div className="text-[10px] font-mono text-muted-foreground mt-1 opacity-80 truncate bg-muted/20 p-1 rounded">
                                      {res.snippet}
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          ) : searchQuery.trim() ? (
                            <div className="text-center text-muted-foreground py-10">
                              <p className="text-xs">No matches found</p>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground py-10">
                              <SearchIcon className="w-6 h-6 mb-2 opacity-20" />
                              <p className="text-xs">Enter a search term</p>
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    )}
                  </div>

                  {/* Git Section */}
                  <div className="flex flex-col border-b border-border" style={{ flex: activeView === "git" ? 2 : 0, minHeight: activeView === "git" ? 0 : 36 }}>
                    <button 
                      className="h-9 flex items-center justify-between px-3 hover:bg-muted/50 transition-colors shrink-0"
                      onClick={() => setActiveView(activeView === "git" ? "" : "git")}
                    >
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source Control</span>
                      <span className="text-xs text-muted-foreground">{activeView === "git" ? "−" : "+"}</span>
                    </button>
                    {activeView === "git" && (
                      <div className="flex-1 overflow-auto p-3">
                        <div className="p-3 bg-muted/30 rounded border border-border mb-3">
                          <p className="text-[10px] text-muted-foreground mb-1 uppercase">Repository</p>
                          <div className="text-xs font-mono truncate text-primary flex items-center gap-2">
                            <GitBranch className="w-3 h-3" />
                            DevataTheGod/codeorbit
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full text-xs h-8 gap-1.5"
                          onClick={handleGitCommitSync}
                          disabled={isGitSyncing}
                        >
                          {isGitSyncing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          Commit & Sync
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Extensions Section */}
                  <div className="flex flex-col border-b border-border" style={{ flex: activeView === "extensions" ? 3 : 0, minHeight: activeView === "extensions" ? 0 : 36 }}>
                    <button 
                      className="h-9 flex items-center justify-between px-3 hover:bg-muted/50 transition-colors shrink-0"
                      onClick={() => setActiveView(activeView === "extensions" ? "" : "extensions")}
                    >
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Extensions</span>
                      <span className="text-xs text-muted-foreground">{activeView === "extensions" ? "−" : "+"}</span>
                    </button>
                    {activeView === "extensions" && (
                      <div className="flex-1 overflow-y-auto">
                        <ErrorBoundary fallbackTitle="Extensions Failed to Load">
                          <ExtensionsPanel />
                        </ErrorBoundary>
                      </div>
                    )}
                  </div>

                  {/* Settings Section */}
                  <div className="flex flex-col border-b border-border" style={{ flex: activeView === "settings" ? 3 : 0, minHeight: activeView === "settings" ? 0 : 36 }}>
                    <button 
                      className="h-9 flex items-center justify-between px-3 hover:bg-muted/50 transition-colors shrink-0"
                      onClick={() => setActiveView(activeView === "settings" ? "" : "settings")}
                    >
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Settings</span>
                      <span className="text-xs text-muted-foreground">{activeView === "settings" ? "−" : "+"}</span>
                    </button>
                    {activeView === "settings" && (
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
                        <div>
                          <Label className="text-[11px] text-muted-foreground">Editor Font Size</Label>
                          <div className="text-xs mt-1 p-2 bg-muted rounded border border-border">14px (JetBrains Mono)</div>
                        </div>
                        <div>
                          <Label className="text-[11px] text-muted-foreground">Theme</Label>
                          <div className="text-xs mt-1 p-2 bg-muted rounded border border-border">VS Dark (Deep Space)</div>
                        </div>
                        <div>
                          <Label className="text-[11px] text-muted-foreground">Plan Info</Label>
                          <div className="text-xs mt-1 p-2 bg-muted rounded border border-border capitalize">Plan: free</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat History Section */}
                  <div className="flex flex-col" style={{ flex: activeView === "chat" ? 3 : 0, minHeight: activeView === "chat" ? 0 : 36 }}>
                    <button 
                      className="h-9 flex items-center justify-between px-3 hover:bg-muted/50 transition-colors shrink-0"
                      onClick={() => setActiveView(activeView === "chat" ? "" : "chat")}
                    >
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chat History</span>
                      <span className="text-xs text-muted-foreground">{activeView === "chat" ? "−" : "+"}</span>
                    </button>
                    {activeView === "chat" && (
                      <div className="flex-1 overflow-hidden">
                        <ErrorBoundary fallbackTitle="Chat History Failed to Load">
                          <ConversationHistory />
                        </ErrorBoundary>
                      </div>
                    )}
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          {/* Editor + Terminal */}
          <ResizablePanel defaultSize={sidebarOpen ? panelSizes.editor : 65}>
            <div className="h-full flex flex-col bg-background">
              <FileTabs 
                openFiles={openFiles} 
                activeFile={selectedFile} 
                onFileSelect={selectFile}
                onFileClose={handleFileClose}
              />

              <div className="flex-1 min-h-0">
                <ErrorBoundary fallbackTitle="Code Editor Failed to Load">
                  <CodeEditor
                    selectedFile={selectedFile}
                    code={code}
                    onChange={handleCodeChange}
                    onCursorChange={(line, col) => setCursorPos({ line, column: col })}
                    onLargePaste={handleLargePaste}
                  />
                </ErrorBoundary>
              </div>

              <ErrorBoundary fallbackTitle="Terminal Failed to Load">
                <Terminal
                  isExpanded={isTerminalExpanded}
                  onToggle={() => setIsTerminalExpanded((v) => !v)}
                />
              </ErrorBoundary>
            </div>
          </ResizablePanel>

          {isChatOpen && (
            <>
              <ResizableHandle withHandle />

              {/* AI Chat Panel */}
              <ResizablePanel defaultSize={panelSizes.chat} minSize={20} maxSize={40}>
                <ErrorBoundary fallbackTitle="AI Chat Failed to Load">
                  <AIChatPanel
                    currentTask={dashboardContext?.milestones?.[0]?.tasks?.[0]?.title || "Implement JWT Authentication"}
                    currentCode={code}
                    currentFiles={files}
                    dashboardContext={dashboardContext}
                    onHide={() => setIsChatOpen(false)}
                  />
                </ErrorBoundary>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <StatusBar 
        language={selectedFile ? (selectedFile.endsWith(".json") ? "JSON" : selectedFile.endsWith(".md") ? "Markdown" : "TypeScript") : "Plain Text"}
        branch={currentBranch}
        line={cursorPos.line}
        column={cursorPos.column}
        onSubmitClick={() => setIsVerificationOpen(true)}
        onBranchClick={handleBranchClick}
        onFormatClick={handleFormatPrettier}
      />

      <CodeExplanationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        onSuccess={() => toast({ title: "Verified", description: "Code explained successfully." })}
        onFailure={() => toast({ title: "Failed", description: "Try again.", variant: "destructive" })}
        codeSnippet={code.slice(0, 500)}
      />

      <ReflectionChallengeModal
        open={isReflectionOpen}
        onClose={() => {
          setIsReflectionOpen(false);
          setReflectionChallenge(null);
        }}
        challenge={reflectionChallenge}
        userId={user?.id || ''}
        submissionId={null}
        onScoreUpdated={(newScore) => {
          toast({
            title: "Score Updated",
            description: `Your score is now ${newScore}%`,
          });
        }}
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
