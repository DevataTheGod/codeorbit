import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase as supabaseOriginal } from "@/integrations/supabase/client";
import { Download, Save, Loader2 } from "lucide-react";

const supabase = supabaseOriginal as any;

interface MentorValidation {
  id?: string;
  studentName: string;
  studentId?: string;
  mentorScore: number;
  mentorRank: number;
  systemScore: number;
  systemRank: number;
  notes: string;
  confidence?: number;
}

interface ValidationComparisonProps {
  systemRankings: Array<{
    name: string;
    score: number;
    rank: number;
    riskLevel: string;
    userId?: string;
  }>;
  mode?: "sandbox" | "real";
}

export const ValidationComparison = ({ systemRankings, mode = "sandbox" }: ValidationComparisonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [mentorRankings, setMentorRankings] = useState<MentorValidation[]>(
    systemRankings.map((s) => ({
      studentName: s.name,
      studentId: s.userId,
      mentorScore: 0,
      mentorRank: 0,
      systemScore: s.score,
      systemRank: s.rank,
      notes: "",
    }))
  );

  const [isLoadingReal, setIsLoadingReal] = useState(false);
  const [realStudents, setRealStudents] = useState<Array<{
    userId: string;
    name: string;
    score: number;
    riskLevel: string;
  }>>([]);

  // Load real students from database when in "real" mode
  useEffect(() => {
    if (mode === "real") {
      loadRealStudents();
    }
  }, [mode]);

  const loadRealStudents = async () => {
    setIsLoadingReal(true);
    try {
      // Fetch submissions with mentor access
      const { data: submissions, error: subError } = await supabase
        .from("project_submissions")
        .select("id, user_id, project_title")
        .eq("mentor_access", true);

      if (subError || !submissions || submissions.length === 0) {
        console.warn("No real students found:", subError);
        return;
      }

      // Fetch profiles for these students
      const userIds = submissions.map((s: any) => s.user_id).filter(Boolean);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      // Fetch understanding scores
      const { data: scores } = await supabase
        .from("understanding_scores")
        .select("user_id, overall, risk_level")
        .in("user_id", userIds);

      // Merge data
      const students = submissions.map((sub: any) => {
        const profile = profiles?.find((p: any) => p.user_id === sub.user_id);
        const score = scores?.find((s: any) => s.user_id === sub.user_id);
        return {
          userId: sub.user_id,
          name: profile?.full_name || sub.project_title || "Unknown Student",
          score: score?.overall || 0,
          riskLevel: score?.risk_level || "unknown",
        };
      });

      setRealStudents(students);

      // Update mentorRankings with real data
      setMentorRankings(students.map((s, i) => ({
        studentName: s.name,
        studentId: s.userId,
        mentorScore: 0,
        mentorRank: 0,
        systemScore: s.score,
        systemRank: i + 1,
        notes: "",
      })));
    } catch (err) {
      console.error("Failed to load real students:", err);
    } finally {
      setIsLoadingReal(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  // Calculate correlation
  const calculateCorrelation = () => {
    const valid = mentorRankings.filter((r) => r.mentorRank > 0);
    if (valid.length < 2) return null;

    const n = valid.length;
    const sumDelta = valid.reduce((sum, r) => sum + Math.abs(r.mentorRank - r.systemRank), 0);
    const maxDelta = (n * (n - 1)) / 2;
    const correlation = Math.round(((maxDelta - sumDelta) / maxDelta) * 100);
    return correlation;
  };

  const updateMentorRank = (index: number, rank: number) => {
    setMentorRankings((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], mentorRank: rank };
      return next;
    });
  };

  const updateMentorScore = (index: number, score: number) => {
    setMentorRankings((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], mentorScore: score };
      return next;
    });
  };

  const updateNotes = (index: number, notes: string) => {
    setMentorRankings((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], notes };
      return next;
    });
  };

  const saveValidation = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      for (const ranking of mentorRankings) {
        if (ranking.mentorRank <= 0) continue;

        // Use studentId if available (real student), otherwise fall back to studentName
        const studentId = ranking.studentId || null;

        const { error } = await supabase.from("mentor_validations").upsert(
          {
            mentor_id: user.id,
            student_id: studentId,
            mentor_score: ranking.mentorScore,
            mentor_rank: ranking.mentorRank,
            confidence: 3,
            notes: ranking.notes || null,
          },
          { onConflict: "mentor_id,student_id" }
        );

        if (error) console.warn("Save validation error:", error);
      }

      toast({
        title: "Validation Saved",
        description: "Your mentor rankings have been saved successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save validation.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Student", "Mentor Rank", "System Rank", "Delta", "System Score", "Risk Level", "Notes"];
    const rows = mentorRankings.map((r) => {
      const system = systemRankings.find((s) => s.name === r.studentName);
      const delta = r.mentorRank > 0 ? Math.abs(r.mentorRank - r.systemRank) : "-";
      return [
        r.studentName,
        r.mentorRank || "-",
        r.systemRank,
        delta,
        r.systemScore,
        system?.riskLevel || "-",
        r.notes || "",
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `validation-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "Validation report downloaded as CSV.",
    });
  };

  const correlation = calculateCorrelation();

  return (
    <Card className="bg-[#0F1322] border-white/5 text-white">
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span>Mentor Validation Comparison</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={exportCSV} className="text-xs">
              <Download className="w-3.5 h-3.5 mr-1" />
              Export CSV
            </Button>
            <Button size="sm" onClick={saveValidation} disabled={isSaving} className="text-xs">
              <Save className="w-3.5 h-3.5 mr-1" />
              {isSaving ? "Saving..." : "Save Rankings"}
            </Button>
          </div>
        </CardTitle>
        <CardDescription className="text-xs">
          Enter your mentor rankings for each student, then compare against the system's Understanding Score rankings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Correlation Score */}
        {correlation !== null && (
          <div className="mb-4 p-3 bg-white/5 rounded-lg flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Rank Correlation</span>
            <Badge
              variant="outline"
              className={
                correlation >= 80
                  ? "text-emerald-400 border-emerald-400/30"
                  : correlation >= 60
                  ? "text-amber-400 border-amber-400/30"
                  : "text-rose-400 border-rose-400/30"
              }
            >
              {correlation}%
            </Badge>
          </div>
        )}

        {/* Rankings Table */}
        <Table>
          <TableHeader className="border-white/5 hover:bg-transparent">
            <TableRow className="border-white/5">
              <TableHead className="text-white text-xs font-semibold">Student</TableHead>
              <TableHead className="text-white text-xs font-semibold">System Rank</TableHead>
              <TableHead className="text-white text-xs font-semibold">System Score</TableHead>
              <TableHead className="text-white text-xs font-semibold">Your Rank</TableHead>
              <TableHead className="text-white text-xs font-semibold">Delta</TableHead>
              <TableHead className="text-white text-xs font-semibold">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mentorRankings.map((row, idx) => {
              const delta =
                row.mentorRank > 0 ? Math.abs(row.mentorRank - row.systemRank) : null;
              return (
                <TableRow key={idx} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-xs font-medium">{row.studentName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">#{row.systemRank}</TableCell>
                  <TableCell className="text-xs">{row.systemScore}%</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      max={mentorRankings.length}
                      value={row.mentorRank || ""}
                      onChange={(e) => updateMentorRank(idx, parseInt(e.target.value) || 0)}
                      className="w-16 h-7 text-xs bg-white/5 border-white/10"
                      placeholder="#"
                    />
                  </TableCell>
                  <TableCell>
                    {delta !== null ? (
                      <Badge
                        variant="outline"
                        className={
                          delta === 0
                            ? "text-emerald-400 border-emerald-400/30 text-xs"
                            : delta <= 1
                            ? "text-amber-400 border-amber-400/30 text-xs"
                            : "text-rose-400 border-rose-400/30 text-xs"
                        }
                      >
                        {delta === 0 ? "Match" : `±${delta}`}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={row.notes}
                      onChange={(e) => updateNotes(idx, e.target.value)}
                      className="w-32 h-7 text-xs bg-white/5 border-white/10"
                      placeholder="Optional notes"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
