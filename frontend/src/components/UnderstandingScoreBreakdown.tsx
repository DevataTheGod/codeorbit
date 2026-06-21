import { UnderstandingScore, UnderstandingScoreService } from "@/services/UnderstandingScoreService";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Target, Activity, MessageSquare, TrendingUp, AlertTriangle } from "lucide-react";

interface UnderstandingScoreBreakdownProps {
  score: UnderstandingScore;
  className?: string;
}

export const UnderstandingScoreBreakdown = ({ score, className }: UnderstandingScoreBreakdownProps) => {
  const riskColor = UnderstandingScoreService.getRiskColor(score.riskLevel);
  const riskLabel = UnderstandingScoreService.getRiskLabel(score.riskLevel);

  // Calculate paste penalty from factors if available
  const pasteFactor = score.factors?.find(f => f.signal === 'paste-penalty');
  const pastePenalty = pasteFactor ? Math.round(pasteFactor.value * pasteFactor.weight) : 0;

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Score Breakdown
          </span>
          <Badge className={cn("text-xs", riskColor)}>{riskLabel}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {/* Overall Score */}
        <div className="text-center py-3 bg-secondary/30 rounded-lg">
          <div className="text-3xl font-bold">{score.overall}</div>
          <div className="text-xs text-muted-foreground mt-1">Overall Understanding Score</div>
        </div>

        {/* Factor Breakdown */}
        <div className="space-y-3">
          {/* Engagement */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-500" />
                Engagement
              </span>
              <span className="text-sm font-medium">{score.engagement}%</span>
            </div>
            <Progress value={score.engagement} className="h-2" />
            <p className="text-[10px] text-muted-foreground mt-1">
              Orbit interactions, typing time, task attempts
            </p>
          </div>

          {/* Explanation / Reflections */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                Reflection Quality
              </span>
              <span className="text-sm font-medium">{score.explanation}%</span>
            </div>
            <Progress value={score.explanation} className="h-2" />
            <p className="text-[10px] text-muted-foreground mt-1">
              Response quality, explanation depth, code references
            </p>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                Project Progress
              </span>
              <span className="text-sm font-medium">{score.progress}%</span>
            </div>
            <Progress value={score.progress} className="h-2" />
            <p className="text-[10px] text-muted-foreground mt-1">
              Milestones completed, tasks finished
            </p>
          </div>

          {/* Paste Penalty (if any) */}
          {pastePenalty > 0 && (
            <div className="flex items-center justify-between p-2 bg-destructive/10 rounded-md">
              <span className="text-sm flex items-center gap-1.5 text-destructive">
                <AlertTriangle className="w-3.5 h-3.5" />
                Paste Penalty
              </span>
              <span className="text-sm font-medium text-destructive">-{pastePenalty}</span>
            </div>
          )}
        </div>

        {/* Factor Details */}
        {score.factors && score.factors.length > 0 && (
          <div className="border-t border-border pt-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Detailed Signals
            </h4>
            <div className="space-y-1.5">
              {score.factors.map((factor, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{factor.description}</span>
                  <span className="font-medium">{Math.round(factor.value)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confidence */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2">
          <span>Score Confidence</span>
          <span>{Math.round(score.confidence * 100)}%</span>
        </div>
      </CardContent>
    </Card>
  );
};
