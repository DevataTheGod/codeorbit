import { supabase as supabaseOriginal } from '@/integrations/supabase/client';
const supabase = supabaseOriginal as any;

export interface ScoreFactors {
  engagement: number;      // 0-100: Orbit interactions, time spent
  explanation: number;     // 0-100: Reflection responses, code explanations
  progress: number;        // 0-100: Milestones completed, tasks finished
}

export interface UnderstandingScore {
  id: string;
  userId: string;
  submissionId?: string | null;
  overall: number;         // 0-100
  engagement: number;
  explanation: number;
  progress: number;
  riskLevel: 'mastery' | 'on-track' | 'at-risk' | 'struggling' | 'critical';
  confidence: number;      // 0-1: How confident we are in the score
  scoreVersion: string;    // e.g. "v1", "v1.1" — tracks algorithm changes
  conceptScores?: Record<string, number>;
  factors: ScoreFactorDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface ScoreFactorDetail {
  type: 'engagement' | 'explanation' | 'progress';
  signal: string;
  value: number;
  weight: number;
  description: string;
}

export interface TelemetryEvent {
  id: string;
  userId: string;
  conversationId?: string | null;
  eventType: 'paste' | 'typing' | 'orbit-interaction' | 'milestone-complete' | 'reflection-response' | 'help-request';
  eventData: Record<string, any>;
  createdAt: string;
}

const STORAGE_KEY = 'CODEORBIT_UNDERSTANDING_SCORES';
const TELEMETRY_KEY = 'CODEORBIT_TELEMETRY';
const SCORE_VERSION = 'v1';

// Weight configuration
const WEIGHTS = {
  engagement: 0.3,
  explanation: 0.4,
  progress: 0.3,
};

// Risk level thresholds
const RISK_THRESHOLDS = {
  mastery: 90,
  'on-track': 75,
  'at-risk': 60,
  struggling: 40,
  critical: 0,
};

export const UnderstandingScoreService = {
  /**
   * Calculate understanding score from telemetry events
   */
  calculateScore(
    userId: string,
    submissionId: string | null,
    telemetryEvents: TelemetryEvent[],
    milestonesCompleted: number,
    totalMilestones: number,
    reflectionScores: number[]
  ): UnderstandingScore {
    // Calculate engagement score
    const engagement = this.calculateEngagement(telemetryEvents);

    // Calculate explanation score
    const explanation = this.calculateExplanation(reflectionScores);

    // Calculate progress score
    const progress = this.calculateProgress(milestonesCompleted, totalMilestones);

    // Calculate overall score
    const overall = Math.round(
      engagement * WEIGHTS.engagement +
      explanation * WEIGHTS.explanation +
      progress * WEIGHTS.progress
    );

    // Determine risk level
    const riskLevel = this.getRiskLevel(overall);

    // Calculate confidence based on data quantity
    const confidence = this.calculateConfidence(telemetryEvents.length, reflectionScores.length);

    // Generate factor details
    const factors = this.generateFactorDetails(telemetryEvents, reflectionScores, milestonesCompleted, totalMilestones);

    return {
      id: crypto.randomUUID(),
      userId,
      submissionId,
      overall,
      engagement,
      explanation,
      progress,
      riskLevel,
      confidence,
      scoreVersion: SCORE_VERSION,
      factors,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Calculate engagement score from telemetry events
   */
  calculateEngagement(events: TelemetryEvent[]): number {
    let score = 0;

    // Orbit interactions (40% of engagement)
    const orbitInteractions = events.filter(e => e.eventType === 'orbit-interaction').length;
    score += Math.min(orbitInteractions / 20, 1) * 40;

    // Active typing time (30% of engagement)
    const typingEvents = events.filter(e => e.eventType === 'typing');
    const totalTypingTime = typingEvents.reduce((sum, e) => sum + (e.eventData.duration || 0), 0);
    score += Math.min(totalTypingTime / 3600, 1) * 30; // 1 hour = full score

    // Task attempts (20% of engagement)
    const taskAttempts = events.filter(e => e.eventType === 'milestone-complete').length;
    score += Math.min(taskAttempts / 5, 1) * 20;

    // Help requests (10% of engagement) - penalize excessive, reward moderate
    const helpRequests = events.filter(e => e.eventType === 'help-request').length;
    if (helpRequests > 0 && helpRequests <= 3) {
      score += 10; // Good: asking for help appropriately
    } else if (helpRequests > 5) {
      score += Math.max(0, 10 - (helpRequests - 5) * 2); // Penalize excessive
    }

    return Math.min(Math.round(score), 100);
  },

  /**
   * Calculate explanation score from reflection responses
   */
  calculateExplanation(reflectionScores: number[]): number {
    if (reflectionScores.length === 0) return 50; // Default when no data

    // Average of reflection scores
    const avg = reflectionScores.reduce((sum, s) => sum + s, 0) / reflectionScores.length;
    return Math.round(avg);
  },

  /**
   * Calculate progress score from milestones
   */
  calculateProgress(milestonesCompleted: number, totalMilestones: number): number {
    if (totalMilestones === 0) return 0;
    return Math.round((milestonesCompleted / totalMilestones) * 100);
  },

  /**
   * Get risk level from overall score
   */
  getRiskLevel(score: number): UnderstandingScore['riskLevel'] {
    if (score >= RISK_THRESHOLDS.mastery) return 'mastery';
    if (score >= RISK_THRESHOLDS['on-track']) return 'on-track';
    if (score >= RISK_THRESHOLDS['at-risk']) return 'at-risk';
    if (score >= RISK_THRESHOLDS['struggling']) return 'struggling';
    return 'critical';
  },

  /**
   * Calculate confidence based on data quantity
   */
  calculateConfidence(eventCount: number, reflectionCount: number): number {
    // More data = higher confidence
    const eventConfidence = Math.min(eventCount / 50, 0.5); // 50 events = 0.5
    const reflectionConfidence = Math.min(reflectionCount / 10, 0.5); // 10 reflections = 0.5
    return Math.round((eventConfidence + reflectionConfidence) * 100) / 100;
  },

  /**
   * Generate detailed factor breakdown
   */
  generateFactorDetails(
    events: TelemetryEvent[],
    reflectionScores: number[],
    milestonesCompleted: number,
    totalMilestones: number
  ): ScoreFactorDetail[] {
    const factors: ScoreFactorDetail[] = [];

    // Engagement factors
    const orbitInteractions = events.filter(e => e.eventType === 'orbit-interaction').length;
    factors.push({
      type: 'engagement',
      signal: 'orbit-interactions',
      value: Math.min(orbitInteractions / 20, 1) * 100,
      weight: 0.4,
      description: `${orbitInteractions} Orbit interactions`,
    });

    // Explanation factors
    if (reflectionScores.length > 0) {
      const avgReflection = reflectionScores.reduce((a, b) => a + b, 0) / reflectionScores.length;
      factors.push({
        type: 'explanation',
        signal: 'reflection-quality',
        value: avgReflection,
        weight: 0.5,
        description: `${reflectionScores.length} reflections, avg ${Math.round(avgReflection)}%`,
      });
    }

    // Progress factors
    factors.push({
      type: 'progress',
      signal: 'milestones-completed',
      value: totalMilestones > 0 ? (milestonesCompleted / totalMilestones) * 100 : 0,
      weight: 0.5,
      description: `${milestonesCompleted}/${totalMilestones} milestones completed`,
    });

    return factors;
  },

  /**
   * Record telemetry event to local storage and Supabase
   */
  async recordEvent(event: Omit<TelemetryEvent, 'id' | 'createdAt'>): Promise<TelemetryEvent> {
    const newEvent: TelemetryEvent = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    // Save locally
    const events = this.getLocalEvents();
    events.push(newEvent);
    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(events));

    // Save to Supabase
    try {
      const { error } = await supabase.from('telemetry_events').insert({
        id: newEvent.id,
        user_id: newEvent.userId,
        conversation_id: newEvent.conversationId,
        event_type: newEvent.eventType,
        event_data: newEvent.eventData,
        created_at: newEvent.createdAt,
      });
      if (error) console.warn('Supabase telemetry insert error:', error);
    } catch (err) {
      console.warn('Supabase telemetry save failed:', err);
    }

    return newEvent;
  },

  /**
   * Get local telemetry events
   */
  getLocalEvents(): TelemetryEvent[] {
    try {
      const raw = localStorage.getItem(TELEMETRY_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as TelemetryEvent[];
    } catch {
      return [];
    }
  },

  /**
   * Get events for a user
   */
  getEventsForUser(userId: string): TelemetryEvent[] {
    return this.getLocalEvents().filter(e => e.userId === userId);
  },

  /**
   * Save score locally and to Supabase
   */
  async save(score: UnderstandingScore): Promise<void> {
    // Save locally
    const scores = this.getLocalScores();
    const existingIndex = scores.findIndex(
      s => s.userId === score.userId && s.submissionId === score.submissionId
    );
    if (existingIndex >= 0) {
      scores[existingIndex] = score;
    } else {
      scores.push(score);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));

    // Save to Supabase
    try {
      const { error } = await supabase
        .from('understanding_scores')
        .upsert({
          user_id: score.userId,
          submission_id: score.submissionId || null,
          overall: score.overall,
          engagement: score.engagement,
          explanation: score.explanation,
          progress: score.progress,
          risk_level: score.riskLevel,
          confidence: score.confidence,
          score_version: score.scoreVersion || SCORE_VERSION,
          score_factors: {
            engagement: score.engagement,
            explanation: score.explanation,
            progress: score.progress,
            overall: score.overall,
          },
          concept_scores: score.conceptScores || {},
          factors: score.factors,
          updated_at: score.updatedAt,
        }, {
          onConflict: 'user_id,submission_id',
        });
      if (error) console.warn('Supabase save error:', error);
    } catch (err) {
      console.warn('Supabase save failed:', err);
    }
  },

  /**
   * Save score locally (sync version for immediate use)
   */
  saveLocal(score: UnderstandingScore): void {
    const scores = this.getLocalScores();
    const existingIndex = scores.findIndex(
      s => s.userId === score.userId && s.submissionId === score.submissionId
    );
    if (existingIndex >= 0) {
      scores[existingIndex] = score;
    } else {
      scores.push(score);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  },

  /**
   * Get local scores
   */
  getLocalScores(): UnderstandingScore[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as UnderstandingScore[];
    } catch {
      return [];
    }
  },

  /**
   * Get score for user/submission (from localStorage)
   */
  getScore(userId: string, submissionId?: string | null): UnderstandingScore | null {
    const scores = this.getLocalScores();
    return scores.find(
      s => s.userId === userId && s.submissionId === (submissionId || null)
    ) || null;
  },

  /**
   * Fetch score from Supabase (for mentor dashboard)
   */
  async getScoreFromSupabase(userId: string, submissionId?: string | null): Promise<UnderstandingScore | null> {
    try {
      let query = supabase
        .from('understanding_scores')
        .select('*')
        .eq('user_id', userId);
      
      if (submissionId) {
        query = query.eq('submission_id', submissionId);
      } else {
        query = query.is('submission_id', null);
      }

      const { data, error } = await query.single();
      
      if (error || !data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        submissionId: data.submission_id,
        overall: Number(data.overall),
        engagement: Number(data.engagement),
        explanation: Number(data.explanation),
        progress: Number(data.progress),
        riskLevel: data.risk_level,
        confidence: Number(data.confidence),
        scoreVersion: data.score_version || SCORE_VERSION,
        conceptScores: data.concept_scores || {},
        factors: data.factors || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (err) {
      console.warn('Failed to fetch score from Supabase:', err);
      return null;
    }
  },

  /**
   * Fetch all scores for a submission (mentor view)
   */
  async getScoresForSubmissionFromSupabase(submissionId: string): Promise<UnderstandingScore[]> {
    try {
      const { data, error } = await supabase
        .from('understanding_scores')
        .select('*')
        .eq('submission_id', submissionId);

      if (error || !data) return [];

      return data.map(row => ({
        id: row.id,
        userId: row.user_id,
        submissionId: row.submission_id,
        overall: Number(row.overall),
        engagement: Number(row.engagement),
        explanation: Number(row.explanation),
        progress: Number(row.progress),
        riskLevel: row.risk_level,
        confidence: Number(row.confidence),
        scoreVersion: row.score_version || SCORE_VERSION,
        conceptScores: row.concept_scores || {},
        factors: row.factors || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      console.warn('Failed to fetch scores from Supabase:', err);
      return [];
    }
  },

  /**
   * Get all scores for a submission (for mentor view)
   */
  getScoresForSubmission(submissionId: string): UnderstandingScore[] {
    return this.getLocalScores().filter(s => s.submissionId === submissionId);
  },

  /**
   * Get score history for a user (ordered by date, oldest first)
   */
  async getScoreHistory(userId: string): Promise<UnderstandingScore[]> {
    try {
      const { data, error } = await supabase
        .from('understanding_scores')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error || !data) return this.getLocalScores().filter(s => s.userId === userId);

      return data.map(row => ({
        id: row.id,
        userId: row.user_id,
        submissionId: row.submission_id,
        overall: Number(row.overall),
        engagement: Number(row.engagement),
        explanation: Number(row.explanation),
        progress: Number(row.progress),
        riskLevel: row.risk_level,
        confidence: Number(row.confidence),
        scoreVersion: row.score_version || SCORE_VERSION,
        conceptScores: row.concept_scores || {},
        factors: row.factors || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      console.warn('Failed to fetch score history:', err);
      return this.getLocalScores().filter(s => s.userId === userId);
    }
  },

  /**
   * Detect paste event
   */
  detectPaste(newLines: number, totalLines: number, timeMs: number): boolean {
    if (totalLines === 0) return false;
    const pasteRatio = newLines / totalLines;
    const speed = newLines / (timeMs / 1000); // lines per second

    // Heuristic: >30% new lines in <30 seconds
    return pasteRatio > 0.3 && speed > 5;
  },

  /**
   * Get risk color for UI
   */
  getRiskColor(riskLevel: UnderstandingScore['riskLevel']): string {
    const colors = {
      mastery: 'text-green-600 bg-green-50',
      'on-track': 'text-blue-600 bg-blue-50',
      'at-risk': 'text-yellow-600 bg-yellow-50',
      struggling: 'text-orange-600 bg-orange-50',
      critical: 'text-red-600 bg-red-50',
    };
    return colors[riskLevel];
  },

  /**
   * Get risk label
   */
  getRiskLabel(riskLevel: UnderstandingScore['riskLevel']): string {
    const labels = {
      mastery: 'Mastery',
      'on-track': 'On Track',
      'at-risk': 'At Risk',
      struggling: 'Struggling',
      critical: 'Critical',
    };
    return labels[riskLevel];
  },
};
