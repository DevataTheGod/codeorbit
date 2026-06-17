import { useState, useEffect, useCallback, useRef } from "react";

interface TelemetryData {
  keystrokeIntervals: number[];
  pasteEvents: { timestamp: number; length: number }[];
  totalCharsTyped: number;
  suspiciousActivity: boolean;
  warnings: string[];
  complexityScore: number;
}

export const useTelemetry = (code: string, skillScore: number = 5) => {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    keystrokeIntervals: [],
    pasteEvents: [],
    totalCharsTyped: 0,
    suspiciousActivity: false,
    warnings: [],
    complexityScore: 0,
  });
  
  const lastKeyTime = useRef<number>(Date.now());
  const initialCodeLength = useRef<number>(code.length);

  const logKeystroke = useCallback(() => {
    const now = Date.now();
    const interval = now - lastKeyTime.current;
    lastKeyTime.current = now;

    // Ignore very long breaks (user went elsewhere)
    if (interval > 5000) return;

    setTelemetry(prev => {
      const newIntervals = [...prev.keystrokeIntervals, interval].slice(-50); // Keep last 50
      
      // Analyze for "Robotic" typing (too consistent or too fast)
      const avgInterval = newIntervals.reduce((a, b) => a + b, 0) / newIntervals.length;
      const isTooFast = newIntervals.length > 10 && avgInterval < 50; // < 50ms per char is ~200 WPM
      
      const newWarnings = [...prev.warnings];
      if (isTooFast && !newWarnings.includes("Robotic typing detected")) {
        newWarnings.push("Robotic typing detected");
      }

      return {
        ...prev,
        keystrokeIntervals: newIntervals,
        totalCharsTyped: prev.totalCharsTyped + 1,
        suspiciousActivity: isTooFast || prev.suspiciousActivity,
        warnings: newWarnings
      };
    });
  }, []);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const pastedText = e.clipboardData?.getData("text") || "";
    const length = pastedText.length;
    
    // Flag if pasting more than 50 characters at once
    if (length > 50) {
      setTelemetry(prev => ({
        ...prev,
        pasteEvents: [...prev.pasteEvents, { timestamp: Date.now(), length }],
        suspiciousActivity: true,
        warnings: [...prev.warnings, `Large code block pasted (${length} chars)`]
      }));
    }
  }, []);

  useEffect(() => {
    // Basic complexity heuristic: unique keywords, nesting depth, and length
    const keywords = ["function", "async", "await", "promise", "interface", "type", "class", "useEffect", "useState", "reduce", "map", "filter"];
    const foundKeywords = keywords.filter(k => code.includes(k)).length;
    const nestingDepth = (code.match(/\{/g) || []).length;
    const complexity = (foundKeywords * 2) + (nestingDepth * 0.5);

    setTelemetry(prev => {
      const newWarnings = [...prev.warnings];
      
      // If code complexity is high but typing volume is low, flag it
      // High complexity (> 15) for a student with low skill score (< 7)
      const isQualityJump = complexity > 15 && skillScore < 7 && prev.totalCharsTyped < (code.length * 0.2);
      
      if (isQualityJump && !newWarnings.includes("Sudden quality jump detected (Possible AI over-reliance)")) {
        newWarnings.push("Sudden quality jump detected (Possible AI over-reliance)");
      }

      return {
        ...prev,
        complexityScore: complexity,
        suspiciousActivity: isQualityJump || prev.suspiciousActivity,
        warnings: newWarnings
      };
    });
  }, [code, skillScore]);

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  return {
    telemetry,
    logKeystroke,
    resetTelemetry: () => setTelemetry({
      keystrokeIntervals: [],
      pasteEvents: [],
      totalCharsTyped: 0,
      suspiciousActivity: false,
      warnings: [],
    })
  };
};
