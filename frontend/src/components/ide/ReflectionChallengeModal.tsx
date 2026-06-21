import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ReflectionChallengeService, ReflectionChallenge } from '@/services/ReflectionChallengeService';
import { UnderstandingScoreService } from '@/services/UnderstandingScoreService';
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ReflectionChallengeModalProps {
  open: boolean;
  onClose: () => void;
  challenge: ReflectionChallenge | null;
  userId: string;
  submissionId?: string | null;
  onScoreUpdated?: (newScore: number) => void;
}

export const ReflectionChallengeModal = ({
  open,
  onClose,
  challenge,
  userId,
  submissionId,
  onScoreUpdated,
}: ReflectionChallengeModalProps) => {
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    feedback: string;
    level: 'excellent' | 'good' | 'partial' | 'poor';
  } | null>(null);

  if (!challenge) return null;

  const handleSubmit = async () => {
    if (!response.trim()) return;

    setIsSubmitting(true);

    // Evaluate the response
    const evaluation = ReflectionChallengeService.evaluateResponse(response, challenge.type);
    setResult(evaluation);

    // Update challenge with response and score
    const updatedChallenge: ReflectionChallenge = {
      ...challenge,
      status: 'completed',
      response: response.trim(),
      score: evaluation.score,
      feedback: evaluation.feedback,
      completedAt: new Date().toISOString(),
    };

    // Save challenge to local storage and Supabase
    await ReflectionChallengeService.save(updatedChallenge);

    // Update understanding score based on reflection result
    const scoreImpact = getScoreImpact(evaluation.level);
    const currentScore = UnderstandingScoreService.getScore(userId, submissionId);
    const newExplanationScore = Math.min(100, Math.max(0, (currentScore?.explanation || 50) + scoreImpact));

    // Calculate new overall score
    const newOverall = currentScore
      ? Math.round(
          currentScore.engagement * 0.3 +
          newExplanationScore * 0.4 +
          currentScore.progress * 0.3
        )
      : 50;

    // Create updated score
    const updatedScore = {
      id: currentScore?.id || crypto.randomUUID(),
      userId,
      submissionId: submissionId || null,
      overall: newOverall,
      engagement: currentScore?.engagement || 50,
      explanation: newExplanationScore,
      progress: currentScore?.progress || 50,
      riskLevel: UnderstandingScoreService.getRiskLevel(newOverall),
      confidence: currentScore?.confidence || 0.5,
      factors: currentScore?.factors || [],
      createdAt: currentScore?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save updated score
    await UnderstandingScoreService.save(updatedScore);

    // Record the reflection response as a telemetry event
    await UnderstandingScoreService.recordEvent({
      userId,
      eventType: 'reflection-response',
      eventData: {
        challengeId: challenge.id,
        challengeType: challenge.type,
        responseLength: response.trim().length,
        score: evaluation.score,
        level: evaluation.level,
        scoreImpact,
      },
    });

    // Notify parent of score update
    onScoreUpdated?.(newOverall);

    setIsSubmitting(false);
  };

  const handleClose = () => {
    setResponse('');
    setResult(null);
    onClose();
  };

  const getScoreImpact = (level: 'excellent' | 'good' | 'partial' | 'poor'): number => {
    switch (level) {
      case 'excellent': return 10;
      case 'good': return 5;
      case 'partial': return -5;
      case 'poor': return -15;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'partial': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return '';
    }
  };

  const getTypeLabel = (type: ReflectionChallenge['type']) => {
    switch (type) {
      case 'post-paste': return 'Code Verification';
      case 'post-milestone': return 'Milestone Verification';
      case 'concept-verification': return 'Concept Check';
      case 'random-verification': return 'Quick Check';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <DialogTitle>Understanding Verification</DialogTitle>
          </div>
          <Badge variant="outline" className="w-fit">
            {getTypeLabel(challenge.type)}
          </Badge>
        </DialogHeader>

        {!result ? (
          <>
            {/* Challenge Question */}
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                To verify you understand what you're working on, please answer this question:
              </p>
              <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                <p className="text-sm font-medium">{challenge.prompt}</p>
                {challenge.context && (
                  <p className="text-xs text-muted-foreground mt-2">{challenge.context}</p>
                )}
              </div>
            </div>

            {/* Response Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Response</label>
              <Textarea
                placeholder="Explain your understanding in your own words. Include the 'why' not just the 'what'..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Tip: Explain tradeoffs, alternatives, and your reasoning for better scores.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Skip (Score Impact: -10)
              </Button>
              <Button onClick={handleSubmit} disabled={!response.trim() || isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Submit Response
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* Result Display */}
            <div className="py-4 space-y-4">
              <div className={cn("rounded-lg p-4", getLevelColor(result.level))}>
                <div className="flex items-center gap-2 mb-2">
                  {result.level === 'excellent' || result.level === 'good' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  <span className="font-medium capitalize">{result.level} Response</span>
                </div>
                <p className="text-sm">{result.feedback}</p>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Response Score</span>
                  <span className="text-2xl font-bold">{result.score}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Score Impact</span>
                  <span className={cn("font-medium", getScoreImpact(result.level) >= 0 ? "text-green-600" : "text-red-600")}>
                    {getScoreImpact(result.level) >= 0 ? '+' : ''}{getScoreImpact(result.level)} points
                  </span>
                </div>
              </div>

              {result.level === 'poor' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Need help?</strong> Ask Orbit to explain this concept using the Socratic method.
                    Click "Ask Orbit" in the chat panel.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Continue
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
