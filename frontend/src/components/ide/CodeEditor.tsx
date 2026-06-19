import Editor from "@monaco-editor/react";
import { Loader2, AlertTriangle } from "lucide-react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface CodeEditorProps {
  selectedFile: string | null;
  code: string;
  onChange: (value: string | undefined) => void;
  onCursorChange?: (line: number, column: number) => void;
}

const getLanguage = (path: string | null): string => {
  if (!path) return "typescript";
  if (path.endsWith(".tsx") || path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".jsx") || path.endsWith(".js")) return "javascript";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".md")) return "markdown";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".html")) return "html";
  return "typescript";
};

const CodeEditor = ({ selectedFile, code, onChange, onCursorChange }: CodeEditorProps) => {
  const { toast } = useToast();
  const { telemetry, logKeystroke } = useTelemetry(code, selectedFile);

  const handleChange = (value: string | undefined) => {
    logKeystroke();
    onChange(value);
  };

  useEffect(() => {
    if (telemetry.suspiciousActivity && telemetry.warnings.length > 0) {
      const latestWarning = telemetry.warnings[telemetry.warnings.length - 1];
      toast({
        title: "Shortcut Detected",
        description: `${latestWarning}. CodeOrbit requires manual coding to ensure skill transfer.`,
        variant: "destructive",
      });
    }
  }, [telemetry.suspiciousActivity, telemetry.warnings, toast]);

  return (
    <div className="h-full w-full bg-ide-editor flex flex-col">
      {selectedFile ? (
        <>
          <div className="h-9 bg-ide-sidebar border-b border-border flex items-center justify-between px-4">
            <span className="text-sm text-muted-foreground">{selectedFile}</span>
            {telemetry.suspiciousActivity && (
              <div className="flex items-center gap-1 text-warning animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-[10px] font-mono">CHEAT DETECTION ACTIVE</span>
              </div>
            )}
          </div>
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={getLanguage(selectedFile)}
              value={code}
              onChange={handleChange}
              onMount={(editor) => {
                editor.onDidChangeCursorPosition((e: any) => {
                  if (onCursorChange) {
                    onCursorChange(e.position.lineNumber, e.position.column);
                  }
                });
              }}
              theme="vs-dark"
              loading={
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              }
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                lineNumbers: "on",
                glyphMargin: true,
                folding: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
                renderLineHighlight: "line",
                cursorBlinking: "smooth",
                smoothScrolling: true,
                tabSize: 2,
                wordWrap: "on",
              }}
            />
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-lg mb-2">Select a file to start coding</p>
            <p className="text-sm">Your journey begins with the first line</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
