import { UnderstandingScoreService } from "@/services/UnderstandingScoreService";

describe("Telemetry Paste Detection Heuristics", () => {
  it("should flag paste events when paste ratio is high and input speed is excessive", () => {
    // 50 new lines out of 100 total lines in 2 seconds (speed = 25 lines/sec, ratio = 50%)
    const isPaste = UnderstandingScoreService.detectPaste(50, 100, 2000);
    expect(isPaste).toBe(true);
  });

  it("should not flag normal typing speeds or low ratios", () => {
    // Typing 1 line out of 100 total lines in 10 seconds (speed = 0.1 lines/sec, ratio = 1%)
    const isPaste = UnderstandingScoreService.detectPaste(1, 100, 10000);
    expect(isPaste).toBe(false);
  });

  it("should handle edge cases like empty documents", () => {
    const isPaste = UnderstandingScoreService.detectPaste(0, 0, 1000);
    expect(isPaste).toBe(false);
  });
});
