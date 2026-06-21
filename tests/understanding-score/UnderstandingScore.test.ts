import { UnderstandingScoreService, TelemetryEvent } from "@/services/UnderstandingScoreService";

describe("UnderstandingScoreService", () => {
  describe("calculateEngagement", () => {
    it("should calculate 0 engagement for empty events list", () => {
      const score = UnderstandingScoreService.calculateEngagement([]);
      expect(score).toBe(0);
    });

    it("should award engagement points for Orbit interactions and typing time", () => {
      const events: TelemetryEvent[] = [
        { id: "1", userId: "u1", eventType: "orbit-interaction", eventData: {}, createdAt: "" },
        { id: "2", userId: "u1", eventType: "orbit-interaction", eventData: {}, createdAt: "" },
        { id: "3", userId: "u1", eventType: "typing", eventData: { duration: 600 }, createdAt: "" }, // 10 mins
      ];

      const score = UnderstandingScoreService.calculateEngagement(events);
      // Orbit interaction = 2/20 * 40 = 4 pts
      // Typing time = 600/3600 * 30 = 5 pts
      // Total = 9 pts
      expect(score).toBe(9);
    });
  });

  describe("calculateExplanation", () => {
    it("should return default score (50) for empty reflections", () => {
      const score = UnderstandingScoreService.calculateExplanation([]);
      expect(score).toBe(50);
    });

    it("should average reflection scores correctly", () => {
      const score = UnderstandingScoreService.calculateExplanation([80, 90, 70]);
      expect(score).toBe(80);
    });
  });

  describe("calculateProgress", () => {
    it("should calculate completion percentages", () => {
      expect(UnderstandingScoreService.calculateProgress(0, 5)).toBe(0);
      expect(UnderstandingScoreService.calculateProgress(3, 5)).toBe(60);
      expect(UnderstandingScoreService.calculateProgress(5, 5)).toBe(100);
    });
  });

  describe("getRiskLevel", () => {
    it("should classify scores into risk groups correctly", () => {
      expect(UnderstandingScoreService.getRiskLevel(95)).toBe("mastery");
      expect(UnderstandingScoreService.getRiskLevel(80)).toBe("on-track");
      expect(UnderstandingScoreService.getRiskLevel(65)).toBe("at-risk");
      expect(UnderstandingScoreService.getRiskLevel(50)).toBe("struggling");
      expect(UnderstandingScoreService.getRiskLevel(20)).toBe("critical");
    });
  });

  describe("calculateScore", () => {
    it("should compute overall score using correct weighting (30% engagement, 40% explanation, 30% progress)", () => {
      const events: TelemetryEvent[] = [
        { id: "1", userId: "u1", eventType: "orbit-interaction", eventData: {}, createdAt: "" },
        { id: "2", userId: "u1", eventType: "orbit-interaction", eventData: {}, createdAt: "" },
      ]; // Orbit: 2/20 * 40 = 4 engagement pts

      const result = UnderstandingScoreService.calculateScore(
        "u1",
        "sub1",
        events,
        4, // completed
        5, // total (80% progress)
        [90] // reflection score (90% explanation)
      );

      // engagement = 4
      // explanation = 90
      // progress = 80
      // overall = 4 * 0.3 + 90 * 0.4 + 80 * 0.3 = 1.2 + 36 + 24 = 61.2 (rounds to 61)
      expect(result.overall).toBe(61);
      expect(result.riskLevel).toBe("at-risk");
    });
  });
});
