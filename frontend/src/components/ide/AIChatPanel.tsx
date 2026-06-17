import { useState, useRef, useEffect } from "react";
import { Bot, Send, Lightbulb, AlertCircle, HelpCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useProjectFiles } from "@/hooks/useProjectFiles";
import { useProgress } from "@/hooks/useProgress";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { LearningBiteCard, getLearningBiteForTask } from "./ContextualLearning";

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
}

// NOTE: "bodhit-chat" is the deployed Supabase Edge Function name.
// To rebrand this endpoint, redeploy the function as "orbit-chat" via:
//   supabase functions deploy orbit-chat --project-ref <YOUR_PROJECT_REF>
// then update this URL to /functions/v1/orbit-chat
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bodhit-chat`;

const AIChatPanel = ({
  currentTask = "Implement JWT Authentication",
  currentCode = "",
  currentFiles = {},
  submissionId = undefined,
  showHeader = false,
  dashboardContext,
}: AIChatPanelProps) => {
  const currentLearningBite = getLearningBiteForTask(currentTask);
  const { toast } = useToast();
  const {
    currentConversation,
    startNewConversation,
    addMessage,
    saveIntake,
    updateTitle,
  } = useConversationHistory();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: submissionId
        ? `Hello! I'm Orbit, your AI programming guide. I see you have an active project submission! I'll help you stay on track and find the answers yourself — I will NOT write code for you.\n\nTell me which milestone you'd like to start with, or ask me for a project structure audit.`
        : `Hello! I'm Orbit, your AI programming guide. I'll help you stay on track and find the answers yourself — I will NOT write code for you.\n\nBefore I create milestones or give guidance, provide all of these inputs (I will NOT proceed until confirmed):\n- Project idea (one-line description)\n- Tech stack / language (primary)\n- Skill level (beginner / intermediate / advanced)\n- Timeline (weeks or target date)\n\nPlease provide the four fields in one message in this format:\nProject idea: ...\nTech stack: ...\nSkill level: ...\nTimeline: ...\n\nAfter you provide and confirm these, I will propose a numbered sequence of milestones. I will not produce runnable code — I will only explain concepts, ask guiding questions, and produce verifiable milestone plans.`,
      type: "explanation",
    },
  ]);
  const [input, setInput] = useState("");
  const [intake, setIntake] = useState<{
    projectIdea: string;
    techStack: string;
    skillLevel: string;
    timeline: string;
  } | null>(null);
  const [intakeConfirmed, setIntakeConfirmed] = useState(!!submissionId);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allowFileAccess, setAllowFileAccess] = useState(false);
  const [allowProgressAccess, setAllowProgressAccess] = useState(true);
  const [allowDashboardAccess, setAllowDashboardAccess] = useState(true);
  const [pendingFileOps, setPendingFileOps] = useState<any | null>(null);
  const [showFileOpsDialog, setShowFileOpsDialog] = useState(false);
  const [pendingMilestoneOps, setPendingMilestoneOps] = useState<any | null>(null);
  const [showMilestoneOpsDialog, setShowMilestoneOpsDialog] = useState(false);
  const [opsLog, setOpsLog] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  let fs: ReturnType<typeof useProjectFiles> | null = null;
  try {
    // useProjectFiles requires provider; if not present, we'll fall back to props
    // eslint-disable-next-line react-hooks/rules-of-hooks
    fs = useProjectFiles();
  } catch (e) {
    fs = null;
  }

  // Progress entries (read-only) for optional inclusion in chat payload
  const { entries: progressEntries } = useProgress();

  // Initialize conversation on mount
  useEffect(() => {
    if (!currentConversation) {
      startNewConversation("Orbit Chat - " + new Date().toLocaleString(), submissionId);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
    };

    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    // Persist user message to DB
    if (currentConversation) {
      addMessage("user", userMessage);
    }

    let assistantContent = "";

    try {
      // Prepare project payloads separately to avoid complex inline expressions
      const projectFilesList = Object.keys(currentFiles || {});
      const projectStructurePayload = currentFiles
        ? JSON.stringify(
          Object.values(currentFiles).map((f: any) => ({
            path: f.path,
            type: f.type,
            language: f.language,
          }))
        )
        : undefined;
      const projectFilesContentPayload = allowFileAccess
        ? fs
          ? JSON.stringify(fs.files)
          : JSON.stringify(currentFiles)
        : undefined;
      const progressEntriesPayload = allowProgressAccess ? JSON.stringify(progressEntries || []) : undefined;
      const dashboardContextPayload =
        allowDashboardAccess && dashboardContext ? JSON.stringify(dashboardContext) : undefined;

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          currentTask,
          currentCode,
          // Provide file list always; include full file contents only when user allows it
          projectFiles: projectFilesList,
          projectStructure: projectStructurePayload,
          projectFilesContent: projectFilesContentPayload,
          progressEntries: progressEntriesPayload,
          studentDashboardContext: dashboardContextPayload,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        if (resp.status === 429) {
          toast({
            title: "Rate Limited",
            description: "Too many requests. Please wait a moment and try again.",
            variant: "destructive",
          });
        } else if (resp.status === 402) {
          toast({
            title: "Credits Exhausted",
            description: "AI credits have been used up. Please add more credits.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: errorData.error || "Failed to get response",
            variant: "destructive",
          });
        }
        setIsLoading(false);
        return;
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

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && last.id === assistantId) {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return prev;
              });
            }
          } catch {
            /* ignore */
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }

    const extractFencedJson = (text: string, tag: string) => {
      const startTag = `\`\`\`${tag}`;
      const start = text.indexOf(startTag);
      if (start === -1) return null;
      const closing = text.indexOf("```", start + startTag.length);
      if (closing === -1 || closing <= start) return null;
      const raw = text.slice(start + startTag.length, closing).trim();
      try {
        return { raw, parsed: JSON.parse(raw) };
      } catch {
        return null;
      }
    };

    const fileOpsExtract = assistantContent ? extractFencedJson(assistantContent, "FILE_OPS") : null;
    const mentorReportExtract = assistantContent ? extractFencedJson(assistantContent, "MENTOR_REPORT") : null;
    const milestoneOpsExtract = assistantContent ? extractFencedJson(assistantContent, "MILESTONE_OPS") : null;

    if (fileOpsExtract?.parsed) {
      setPendingFileOps(fileOpsExtract.parsed);
      setShowFileOpsDialog(true);
    }
    if (milestoneOpsExtract?.parsed) {
      setPendingMilestoneOps(milestoneOpsExtract.parsed);
      setShowMilestoneOpsDialog(true);
    }

    // Persist assistant message to DB with parsed metadata
    if (currentConversation && assistantContent) {
      addMessage(
        "assistant",
        assistantContent,
        "explanation",
        fileOpsExtract?.parsed ?? null,
        mentorReportExtract?.parsed ?? null
      );
    }

    // Save mentor report for mentor dashboard
    if (mentorReportExtract?.parsed && submissionId) {
      try {
        await supabase.from("mentor_reports").insert({
          submission_id: submissionId,
          report: mentorReportExtract.parsed,
          raw_text: mentorReportExtract.raw,
        });
      } catch (err) {
        console.error("Error saving mentor report:", err);
      }
    }
  };

  // Apply file operations parsed from assistant after user confirmation
  const applyFileOps = async (ops: any) => {
    if (!ops) return;
    const operations = Array.isArray(ops) ? ops : [ops];
    const applied: any[] = [];
    for (const op of operations) {
      try {
        switch (op.action) {
          case "create": {
            const path = op.path;
            const content = op.content || "";
            const language = op.language || "text";
            if (fs) fs.createNode(path, "file", content, language);
            applied.push({ ...op, status: "ok" });
            break;
          }
          case "update": {
            const path = op.path;
            const content = op.content || "";
            if (fs) fs.updateNode(path, content);
            applied.push({ ...op, status: "ok" });
            break;
          }
          case "delete": {
            const path = op.path;
            const recursive = !!op.recursive;
            if (fs) fs.deleteNode(path, recursive);
            applied.push({ ...op, status: "ok" });
            break;
          }
          case "rename": {
            const oldPath = op.path;
            const newName = op.newName || op.newPath;
            if (fs) fs.renameNode(oldPath, newName);
            applied.push({ ...op, status: "ok" });
            break;
          }
          case "export": {
            // create download of project
            const json = fs ? fs.exportProject() : JSON.stringify(currentFiles, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = op.filename || `orbit-project-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            applied.push({ ...op, status: "ok" });
            break;
          }
          default:
            applied.push({ ...op, status: "unknown-action" });
        }
      } catch (err) {
        applied.push({ ...op, status: "error", error: String(err) });
      }
    }

    // record in ops log
    setOpsLog((l) => [...l, { timestamp: Date.now(), ops: applied }]);
    setShowFileOpsDialog(false);
    setPendingFileOps(null);
  };

  const applyMilestoneOps = async (ops: any) => {
    if (!ops) return;
    const operations = Array.isArray(ops) ? ops : [ops];
    const results: any[] = [];

    for (const op of operations) {
      try {
        switch (op.action) {
          case "update_milestone": {
            if (!op.milestone_id) throw new Error("milestone_id is required");
            const payload: any = {};
            if (op.status) payload.status = op.status;
            if (op.title) payload.title = op.title;
            if (op.description) payload.description = op.description;
            if (op.due_date) payload.due_date = op.due_date;
            const { error } = await supabase.from("milestones").update(payload).eq("id", op.milestone_id);
            if (error) throw error;
            results.push({ ...op, status: "ok" });
            break;
          }
          case "update_task": {
            if (!op.task_id) throw new Error("task_id is required");
            const payload: any = {};
            if (op.status) payload.status = op.status;
            if (typeof op.progress === "number") payload.progress = op.progress;
            if (op.title) payload.title = op.title;
            if (op.description) payload.description = op.description;
            const { error } = await supabase.from("tasks").update(payload).eq("id", op.task_id);
            if (error) throw error;
            results.push({ ...op, status: "ok" });
            break;
          }
          default:
            results.push({ ...op, status: "unknown-action" });
        }
      } catch (err) {
        results.push({ ...op, status: "error", error: String(err) });
      }
    }

    const failed = results.filter((r) => r.status !== "ok").length;
    toast({
      title: failed ? "Milestone ops completed with warnings" : "Milestone ops applied",
      description: failed ? `${results.length - failed} succeeded, ${failed} failed` : `${results.length} changes applied`,
      variant: failed ? "destructive" : "default",
    });
    setShowMilestoneOpsDialog(false);
    setPendingMilestoneOps(null);
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const text = input.trim();
    if (currentConversation) {
      updateTitle(`Orbit: ${text.slice(0, 48)}`);
    }

    // Detect code-request shortcuts and refuse immediately on client-side
    const codeRequestPatterns = [
      /give me the code/i,
      /paste the code/i,
      /implement for me/i,
      /write the code/i,
      /full implementation/i,
      /complete solution/i,
    ];
    if (codeRequestPatterns.some((rx) => rx.test(text))) {
      const refusal: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "I cannot provide code. Describe your intended approach and I will guide the logic, tests, and structure.",
        type: "warning",
      };
      const userMsg = { id: Date.now().toString(), role: "user" as const, content: text };
      const refusalMsg = refusal;
      setMessages((m) => [...m, userMsg, refusalMsg]);
      // Persist to DB
      if (currentConversation) {
        addMessage("user", text);
        addMessage("assistant", refusal.content, "warning");
      }
      setInput("");
      return;
    }

    // If intake not yet confirmed, try to parse intake from the message
    if (!intakeConfirmed) {
      const parsed = parseIntakeFromText(text);
      if (parsed) {
        setIntake(parsed);
        setAwaitingConfirmation(true);
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I parsed your intake as:\nProject idea: ${parsed.projectIdea}\nTech stack: ${parsed.techStack}\nSkill level: ${parsed.skillLevel}\nTimeline: ${parsed.timeline}\n\nPlease reply with **yes** to confirm or **no** to re-enter the details.`,
          type: "question",
        };
        setMessages((m) => [...m, { id: Date.now().toString(), role: "user", content: text }, assistantMsg]);
        // Persist to DB
        if (currentConversation) {
          addMessage("user", text);
          addMessage("assistant", assistantMsg.content, "question");
        }
        setInput("");
        return;
      }

      // If user is replying to confirmation
      if (awaitingConfirmation && /^yes$/i.test(text) && intake) {
        setIntakeConfirmed(true);
        setAwaitingConfirmation(false);
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Intake confirmed. Tell me which milestone you'd like to start with, or ask me to create the full milestone sequence.",
          type: "explanation",
        };
        setMessages((m) => [...m, { id: Date.now().toString(), role: "user", content: text }, assistantMsg]);
        // Persist to DB and save intake
        if (currentConversation) {
          addMessage("user", text);
          addMessage("assistant", assistantMsg.content, "explanation");
          saveIntake(intake);
        }
        setInput("");
        return;
      }

      if (awaitingConfirmation && /^no$/i.test(text)) {
        setIntake(null);
        setAwaitingConfirmation(false);
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Okay — please re-enter the intake fields in the required format.",
          type: "explanation",
        };
        setMessages((m) => [...m, { id: Date.now().toString(), role: "user", content: text }, assistantMsg]);
        // Persist to DB
        if (currentConversation) {
          addMessage("user", text);
          addMessage("assistant", assistantMsg.content, "explanation");
        }
        setInput("");
        return;
      }

      // If we reach here, intake is required but not provided in correct format
      const helper: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Please provide the required intake fields in this exact format:\nProject idea: ...\nTech stack: ...\nSkill level: ...\nTimeline: ...\n\nOr confirm the parsed intake with 'yes'/'no'.",
        type: "question",
      };
      setMessages((m) => [...m, { id: Date.now().toString(), role: "user", content: text }, helper]);
      // Persist to DB
      if (currentConversation) {
        addMessage("user", text);
        addMessage("assistant", helper.content, "question");
      }
      setInput("");
      return;
    }

    // If intake confirmed, proceed to stream chat
    streamChat(text);
  };

  // Helper: parse intake fields from a user's message
  const parseIntakeFromText = (text: string) => {
    // Accept lines like: Project idea: ..., Tech stack: ..., Skill level: ..., Timeline: ...
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const map: Record<string, string> = {};
    for (const line of lines) {
      const m = line.match(/^([^:]+):\s*(.+)$/);
      if (m) {
        map[m[1].toLowerCase()] = m[2];
      }
    }
    const projectIdea = map["project idea"] || map["project"] || "";
    const techStack = map["tech stack"] || map["tech"] || "";
    const skillLevel = map["skill level"] || map["skill"] || "";
    const timeline = map["timeline"] || map["timeframe"] || "";
    if (projectIdea && techStack && skillLevel && timeline) {
      return { projectIdea, techStack, skillLevel, timeline };
    }
    return null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getMessageIcon = (type?: Message["type"]) => {
    switch (type) {
      case "hint":
        return <Lightbulb className="w-4 h-4 text-ide-warning" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-ide-error" />;
      case "question":
        return <HelpCircle className="w-4 h-4 text-ide-info" />;
      default:
        return <Bot className="w-4 h-4 text-primary" />;
    }
  };

  const quickPrompts = [
    "Review my current milestone progress",
    "Suggest the next best task to complete",
    "Create mentor-ready status summary",
    "Audit my project structure and gaps",
  ];

  const addQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {showHeader && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Orbit AI</h3>
              <p className="text-xs text-muted-foreground">Powered by AI • Never writes code</p>
            </div>
          </div>
        </div>
      )}

      {currentLearningBite && (
        <div className="px-4 pt-4">
          <LearningBiteCard bite={currentLearningBite} />
        </div>
      )}

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                  {getMessageIcon(message.type)}
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-4 py-3 text-sm whitespace-pre-wrap",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-foreground"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted/50 rounded-lg px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border space-y-3">
        <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Access Controls
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                const next = !(allowFileAccess && allowProgressAccess && allowDashboardAccess);
                setAllowFileAccess(next);
                setAllowProgressAccess(next);
                setAllowDashboardAccess(next);
              }}
            >
              {allowFileAccess && allowProgressAccess && allowDashboardAccess ? "Disable Full Access" : "Enable Full Access"}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <label className="flex items-center gap-2 text-xs p-2 border border-border rounded-md">
              <input
                type="checkbox"
                checked={allowFileAccess}
                onChange={(e) => setAllowFileAccess(e.target.checked)}
              />
              <span>Project files</span>
            </label>
            <label className="flex items-center gap-2 text-xs p-2 border border-border rounded-md">
              <input
                type="checkbox"
                checked={allowProgressAccess}
                onChange={(e) => setAllowProgressAccess(e.target.checked)}
              />
              <span>Milestones progress</span>
            </label>
            <label className="flex items-center gap-2 text-xs p-2 border border-border rounded-md">
              <input
                type="checkbox"
                checked={allowDashboardAccess}
                onChange={(e) => setAllowDashboardAccess(e.target.checked)}
              />
              <span>Student dashboard data</span>
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            File and milestone modifications are always gated by a confirmation dialog before applying.
          </p>
        </div>

        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for guidance, request a milestone update plan, or audit your IDE project..."
            className="flex-1 min-h-[84px] bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={3}
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-[84px] px-5"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Send
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <Button
              key={prompt}
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => addQuickPrompt(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
        <div className="text-[11px] text-muted-foreground text-center">
          Enter to send, Shift+Enter for newline.
        </div>
      </div>

      <Dialog open={showFileOpsDialog} onOpenChange={setShowFileOpsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assistant Requested File Operations</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <pre className="text-xs font-mono bg-muted/50 p-2 rounded">{JSON.stringify(pendingFileOps, null, 2)}</pre>
            <p className="text-sm text-muted-foreground">Review the proposed operations above. Confirm to apply them to your project files.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowFileOpsDialog(false); setPendingFileOps(null); }}>Cancel</Button>
            <Button onClick={() => applyFileOps(pendingFileOps)}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMilestoneOpsDialog} onOpenChange={setShowMilestoneOpsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assistant Requested Milestone Updates</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <pre className="text-xs font-mono bg-muted/50 p-2 rounded max-h-64 overflow-auto">
              {JSON.stringify(pendingMilestoneOps, null, 2)}
            </pre>
            <p className="text-sm text-muted-foreground">
              These updates affect milestone/task status in Supabase. Confirm to apply.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowMilestoneOpsDialog(false);
                setPendingMilestoneOps(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => applyMilestoneOps(pendingMilestoneOps)}>Apply Updates</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AIChatPanel;
