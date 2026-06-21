import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { UnderstandingScoreService, UnderstandingScore } from '@/services/UnderstandingScoreService';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface UnderstandingScoreWidgetProps {
  userId: string;
  submissionId?: string | null;
  showDetails?: boolean;
  compact?: boolean;
}

export const UnderstandingScoreWidget = ({
  userId,
  submissionId,
  showDetails = false,
  compact = false,
}: UnderstandingScoreWidgetProps) => {
  const [score, setScore] = useState<UnderstandingScore | null>(null);

  useEffect(() => {
    const loadScore = async () => {
      // Try localStorage first
      let existingScore = UnderstandingScoreService.getScore(userId, submissionId);
      
      // If not found locally, fetch from Supabase
      if (!existingScore) {
        existingScore = await UnderstandingScoreService.getScoreFromSupabase(userId, submissionId);
      }
      
      setScore(existingScore);
    };
    
    loadScore();
  }, [userId, submissionId]);

  if (!score) {
    return (
      <Card className={cn("border-border", compact && "p-2")}>
        <CardContent className={cn("flex items-center justify-center", compact ? "py-2" : "py-8")}>
          <p className="text-sm text-muted-foreground">No score data yet</p>
        </CardContent>
      </Card>
    );
  }

  const riskColor = UnderstandingScoreService.getRiskColor(score.riskLevel);
  const riskLabel = UnderstandingScoreService.getRiskLabel(score.riskLevel);

  const RiskIcon = () => {
    switch (score.riskLevel) {
      case 'mastery':
      case 'on-track':
        return <CheckCircle className="w-4 h-4" />;
      case 'at-risk':
        return <AlertTriangle className="w-4 h-4" />;
      case 'struggling':
      case 'critical':
        return <XCircle className="w-4 h-4" />;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", riskColor)}>
          <RiskIcon />
          <span>{score.overall}%</span>
        </div>
        <span className="text-xs text-muted-foreground">{riskLabel}</span>
      </div>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Understanding Score</CardTitle>
          <Badge className={cn("text-xs", riskColor)}>
            <RiskIcon />
            <span className="ml-1">{riskLabel}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="text-center">
          <div className="text-4xl font-bold">{score.overall}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Confidence: {Math.round(score.confidence * 100)}%
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Engagement</span>
              <span className="text-xs font-medium">{score.engagement}%</span>
            </div>
            <Progress value={score.engagement} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Explanation</span>
              <span className="text-xs font-medium">{score.explanation}%</span>
            </div>
            <Progress value={score.explanation} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-medium">{score.progress}%</span>
            </div>
            <Progress value={score.progress} className="h-2" />
          </div>
        </div>

        {/* Detailed Factors */}
        {showDetails && score.factors.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="text-xs font-medium mb-2">Factors</p>
            <div className="space-y-2">
              {score.factors.map((factor, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{factor.description}</span>
                  <span className="font-medium">{Math.round(factor.value)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <p className="text-xs text-muted-foreground text-center">
          Updated: {new Date(score.updatedAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
};
