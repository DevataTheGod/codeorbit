import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Loader2, 
  Sparkles,
  Plus,
  ArrowUp,
  X,
  Target,
  Activity,
  Clock,
  MessageSquare,
  CheckCircle2,
  Circle,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { useProjectFiles } from "@/hooks/useProjectFiles";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "explanation" | "hint" | "question" | "warning";
}

interface AIChatPanelProps {
  currentTask?: string;
  currentCode?: string;
  currentFiles?: Record<string, any>;
  submissionId?: string | null;
  showHeader?: boolean;
  dashboardContext?: Record<string, any>;
  onHide?: () => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/orbit-chat`;

const AIChatPanel = ({
  currentTask = "Implement JWT Authentication",
  currentCode = "",
  currentFiles = {},
  submissionId = undefined,
  showHeader = false,
  dashboardContext,
  onHide,
}: AIChatPanelProps) => {
  const { toast } = useToast();
  const { currentConversation, startNewConversation, addMessage } = useConversationHistory();
  const { files } = useProjectFiles();
  const fileCount = Object.keys(files).length;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm Orbit, your AI programming guide. I'll help you stay on track and find the answers yourself — I will NOT write code for you.\n\nBefore I create milestones or give guidance, provide all of these inputs:\n- Project idea (one-line description)\n- Tech stack / language (primary)\n- Skill level (beginner / intermediate / advanced)\n- Timeline (weeks or target date)\n\nPlease provide the four fields in one message in this format:\nProject idea: ...\nTech stack: ...\nSkill level: ...\nTimeline: ...",
      type: "explanation",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Model cycling
  const [selectedModel, setSelectedModel] = useState("Minimax M2.7");

  // Mentions
  const [mentionFilter, setMentionFilter] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(-1);

  // Dynamic tasks from active milestone
  const activeMilestone = dashboardContext?.milestones?.find((m: any) => m.status !== "completed");
  const tasks = activeMilestone?.tasks?.map((t: any, index: number) => ({
    id: t.id || index,
    title: t.title,
    progress: t.progress || 0,
    status: t.status === "completed" ? "completed" : "in-progress"
  })) || [
    { id: 1, title: "Finish landing page", progress: 70, status: "in-progress" },
    { id: 2, title: "Review pull requests", progress: 0, status: "pending", count: 2 },
    { id: 3, title: "Resolve warnings", progress: 0, status: "pending", count: 5 },
  ];

  // Workspace health calculation
  const completedCount = dashboardContext?.milestones?.filter((m: any) => m.status === "completed" || m.status === "approved").length || 0;
  const totalMilestones = dashboardContext?.milestones?.length || 0;
  const milestonesPercent = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 45;

  const health = [
    { label: "Milestones completed", value: `${milestonesPercent}%`, progress: milestonesPercent, color: "bg-green-500" },
    { label: "Project files", value: `${fileCount} files`, progress: Math.min(fileCount * 4, 100), color: "bg-purple-500" },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    if (currentConversation) {
      addMessage("user", input);
    }

    let assistantContent = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          currentTask,
          currentCode,
          projectFiles: Object.keys(currentFiles || {}),
        }),
      });

      if (!resp.ok) {
        throw new Error("Failed to get response");
      }

      if (!resp.body) {
        throw new Error("No response body");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      const assistantId = (Date.now() + 1).toString();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && last.id === assistantId) {
                  return prev.map((m) =>
                    m.id === assistantId ? { ...m, content: assistantContent } : m
                  );
                }
                return [
                  ...prev,
                  { id: assistantId, role: "assistant", content: assistantContent, type: "explanation" },
                ];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (currentConversation) {
        addMessage("assistant", assistantContent);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    const lastAt = value.lastIndexOf("@");
    if (lastAt !== -1 && lastAt >= value.length - 20) {
      setMentionFilter(value.slice(lastAt + 1));
      setMentionIndex(lastAt);
    } else {
      setMentionFilter(null);
      setMentionIndex(-1);
    }
  };

  const handlePlusClick = () => {
    setInput((prev) => prev + "@");
    setMentionFilter("");
    setMentionIndex(input.length);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cycleModel = () => {
    const models = ["Minimax M2.7", "Gemini 1.5 Pro", "Claude 3.5 Sonnet"];
    const nextIndex = (models.indexOf(selectedModel) + 1) % models.length;
    const nextModel = models[nextIndex];
    setSelectedModel(nextModel);
    toast({
      title: "Model Changed",
      description: `Orbit is now running on ${nextModel}`,
    });
  };

  const handleSelectSuggestion = (path: string) => {
    const before = input.slice(0, mentionIndex);
    setInput(before + `@${path} `);
    setMentionFilter(null);
    setMentionIndex(-1);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-background border border-border flex items-center justify-center">
            <Activity className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Productivity</h2>
            <p className="text-[11px] text-muted-foreground">Focused workspace</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={onHide}>
          Hide
        </Button>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="flex flex-col gap-4 p-4">
          {/* Today's Focus Card */}
          <Card className="border-border/50 bg-background">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-green-500" />
                Today's focus
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl",
                    task.status === "in-progress" ? "bg-muted" : "border border-border"
                  )}
                >
                  <span className="text-sm">{task.title}</span>
                  {task.status === "in-progress" ? (
                    <Badge variant="secondary" className="text-[10px]">{task.progress}%</Badge>
                  ) : task.count ? (
                    <Badge variant="outline" className="text-[10px]">{task.count}</Badge>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Workspace Health Card */}
          <Card className="border-border/50 bg-background">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                Workspace health
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {health.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="text-xs font-medium">{item.value}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", item.color)}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Assistant Card */}
          <Card className="border-border/50 bg-background">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ask for refactors, generate snippets, or navigate files without leaving the editor.
              </p>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom Input Section */}
      <div className="border-t border-border p-4 space-y-3 relative">
        {/* Suggestion Dropdown */}
        {mentionFilter !== null && (
          <div className="absolute bottom-[calc(100%+8px)] left-4 right-4 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden text-xs max-h-48 overflow-y-auto">
            <div className="px-3 py-1.5 border-b border-border bg-muted/40 font-semibold text-muted-foreground">
              Files Suggestions
            </div>
            {Object.keys(currentFiles || {}).filter(path => 
              path.toLowerCase().includes(mentionFilter.toLowerCase())
            ).length > 0 ? (
              Object.keys(currentFiles || {}).filter(path => 
                path.toLowerCase().includes(mentionFilter.toLowerCase())
              ).slice(0, 5).map(path => (
                <button
                  key={path}
                  className="w-full text-left px-3 py-2 hover:bg-muted transition-colors truncate"
                  onClick={() => handleSelectSuggestion(path)}
                >
                  {path}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-muted-foreground italic">No matching files</div>
            )}
          </div>
        )}

        {/* Input Bar */}
        <div className="flex items-center gap-2 bg-muted rounded-2xl p-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={handlePlusClick}
          >
            <Plus className="w-4 h-4" />
          </Button>
          
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything, @ to mention"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            disabled={isLoading}
          />
          
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-7 w-7 shrink-0 bg-foreground text-background rounded-lg hover:bg-foreground/90"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Model Info Badges */}
        <div className="flex items-center gap-2">
          <span 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-xs text-muted-foreground cursor-pointer hover:bg-muted/70 transition-colors"
            onClick={cycleModel}
            title="Click to change AI model"
          >
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {selectedModel}
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            Auto
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIChatPanel;
