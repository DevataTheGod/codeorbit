import { ReflectionChallengeService } from "@/services/ReflectionChallengeService";

describe("ReflectionChallengeService", () => {
  describe("evaluateResponse", () => {
    it("should score very short responses as poor", () => {
      const result = ReflectionChallengeService.evaluateResponse("I don't know.", "post-paste");
      expect(result.score).toBeLessThan(30);
      expect(result.level).toBe("poor");
      expect(result.feedback).toContain("Needs more detail");
    });

    it("should award higher score for detailed explanations", () => {
      const response = "This is a detailed response explaining the approach and the tradeoff considered because we need to secure this connection.";
      const result = ReflectionChallengeService.evaluateResponse(response, "post-paste");
      expect(result.score).toBeGreaterThan(50);
      expect(result.feedback).toContain("Good explanation");
    });

    it("should award bonuses for structure and code tags", () => {
      const responseText = "My approach choice was to use a custom hooks framework because of ease of testing:\n- Uses `useState` to cache state locally\n- Considered tradeoff regarding unnecessary re-renders.";
      const result = ReflectionChallengeService.evaluateResponse(responseText, "post-paste");
      
      // Length is > 100, plus explanation keywords: "because", "tradeoff", "approach"
      // Newline and list structure present
      // Backticks/code tag present
      expect(result.score).toBeGreaterThanOrEqual(75);
      expect(["good", "excellent"]).toContain(result.level);
    });
  });
});
