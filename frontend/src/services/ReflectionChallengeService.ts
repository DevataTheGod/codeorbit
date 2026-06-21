import { supabase as supabaseOriginal } from '@/integrations/supabase/client';
const supabase = supabaseOriginal as any;

export interface ReflectionChallenge {
  id: string;
  userId: string;
  conversationId?: string | null;
  milestoneId?: string | null;
  type: 'post-paste' | 'post-milestone' | 'concept-verification' | 'random-verification';
  prompt: string;
  context?: string;
  status: 'pending' | 'completed' | 'skipped';
  response?: string;
  score?: number;         // 0-100
  feedback?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ChallengeTemplate {
  type: ReflectionChallenge['type'];
  prompts: string[];
  contextGenerator?: (data: any) => string;
}

// Challenge templates
const TEMPLATES: ChallengeTemplate[] = [
  {
    type: 'post-paste',
    prompts: [
      "I notice you pasted code. Can you explain what this does in your own words?",
      "You just added some code. Can you walk me through how it works?",
      "That's a significant change. What problem does this code solve?",
      "I see new code here. Can you explain the approach you chose?",
    ],
  },
  {
    type: 'post-milestone',
    prompts: [
      "You've completed {milestone}. Describe your implementation approach. What tradeoffs did you consider?",
      "Great progress on {milestone}! What would you do differently if you started over?",
      "{milestone} is done. Can you explain the architecture you chose and why?",
      "Nice work on {milestone}! What were the hardest parts and how did you solve them?",
    ],
    contextGenerator: (data) => `Milestone: ${data.milestoneName}`,
  },
  {
    type: 'concept-verification',
    prompts: [
      "You mentioned {concept}. Can you explain the difference between {concept} and {alternative}?",
      "I see you used {concept}. When would you choose {concept} over {alternative}?",
      "Can you explain {concept} in simple terms? When is it useful?",
      "What are the tradeoffs of using {concept}?",
    ],
    contextGenerator: (data) => `Concept: ${data.concept}, Alternative: ${data.alternative}`,
  },
  {
    type: 'random-verification',
    prompts: [
      "Quick check: Can you explain what your most recent code does without looking at it?",
      "Pop quiz: What's the main function you just wrote and why?",
      "Can you describe the overall architecture of what you've built so far?",
      "What's the most important decision you made in your code recently?",
    ],
  },
];

// Concept alternatives for verification
const CONCEPT_ALTERNATIVES: Record<string, string[]> = {
  'useState': ['useReducer', 'useRef', 'Context'],
  'useEffect': ['useLayoutEffect', 'useMemo', 'useCallback'],
  'React.memo': ['useMemo', 'useCallback', 'React.PureComponent'],
  'async/await': ['Promises', '.then() chains', 'Generators'],
  'try/catch': ['error boundaries', '.catch()', 'Result types'],
  'REST': ['GraphQL', 'gRPC', 'WebSockets'],
  'SQL': ['NoSQL', 'MongoDB', 'Redis'],
  'JWT': ['Session cookies', 'OAuth tokens', 'API keys'],
  'CSS-in-JS': ['Tailwind', 'CSS Modules', 'BEM'],
  'TypeScript': ['JavaScript', 'Flow', 'JSDoc'],
};

export const ReflectionChallengeService = {
  /**
   * Generate a post-paste challenge
   */
  generatePostPasteChallenge(
    userId: string,
    conversationId: string | null,
    pastedCode: string
  ): ReflectionChallenge {
    const template = TEMPLATES.find(t => t.type === 'post-paste')!;
    const prompt = template.prompts[Math.floor(Math.random() * template.prompts.length)];

    return {
      id: crypto.randomUUID(),
      userId,
      conversationId,
      type: 'post-paste',
      prompt,
      context: `Pasted code length: ${pastedCode.split('\n').length} lines`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Generate a post-milestone challenge
   */
  generatePostMilestoneChallenge(
    userId: string,
    conversationId: string | null,
    milestoneId: string,
    milestoneName: string
  ): ReflectionChallenge {
    const template = TEMPLATES.find(t => t.type === 'post-milestone')!;
    const promptTemplate = template.prompts[Math.floor(Math.random() * template.prompts.length)];
    const prompt = promptTemplate.replace('{milestone}', milestoneName);

    return {
      id: crypto.randomUUID(),
      userId,
      conversationId,
      milestoneId,
      type: 'post-milestone',
      prompt,
      context: template.contextGenerator?.({ milestoneName }),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Generate a concept verification challenge
   */
  generateConceptVerificationChallenge(
    userId: string,
    conversationId: string | null,
    concept: string
  ): ReflectionChallenge {
    const template = TEMPLATES.find(t => t.type === 'concept-verification')!;
    const alternatives = CONCEPT_ALTERNATIVES[concept] || ['similar concept'];
    const alternative = alternatives[Math.floor(Math.random() * alternatives.length)];
    const promptTemplate = template.prompts[Math.floor(Math.random() * template.prompts.length)];
    const prompt = promptTemplate
      .replace('{concept}', concept)
      .replace('{alternative}', alternative);

    return {
      id: crypto.randomUUID(),
      userId,
      conversationId,
      type: 'concept-verification',
      prompt,
      context: template.contextGenerator?.({ concept, alternative }),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Generate a random verification challenge
   */
  generateRandomVerificationChallenge(
    userId: string,
    conversationId: string | null
  ): ReflectionChallenge {
    const template = TEMPLATES.find(t => t.type === 'random-verification')!;
    const prompt = template.prompts[Math.floor(Math.random() * template.prompts.length)];

    return {
      id: crypto.randomUUID(),
      userId,
      conversationId,
      type: 'random-verification',
      prompt,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Evaluate a reflection response
   */
  evaluateResponse(response: string, challengeType: ReflectionChallenge['type']): {
    score: number;
    feedback: string;
    level: 'excellent' | 'good' | 'partial' | 'poor';
  } {
    const responseLength = response.trim().length;
    const wordCount = response.trim().split(/\s+/).length;
    const hasCode = /```[\s\S]*```/.test(response) || /`[^`]+`/.test(response);
    const hasExplanation = /\b(because|therefore|however|alternatively|tradeoff|consider|approach)\b/i.test(response);
    const hasStructure = /\n/.test(response) || /[-*]\s/.test(response);

    let score = 0;
    let level: 'excellent' | 'good' | 'partial' | 'poor' = 'poor';

    // Base score from length
    if (responseLength < 20) {
      score = 10;
    } else if (responseLength < 50) {
      score = 30;
    } else if (responseLength < 100) {
      score = 50;
    } else if (responseLength < 200) {
      score = 70;
    } else {
      score = 80;
    }

    // Bonus for explanation words
    if (hasExplanation) score += 10;

    // Bonus for structure
    if (hasStructure) score += 5;

    // Bonus for code references (shows they understand)
    if (hasCode) score += 5;

    // Determine level
    if (score >= 90) level = 'excellent';
    else if (score >= 75) level = 'good';
    else if (score >= 50) level = 'partial';
    else level = 'poor';

    // Generate feedback
    let feedback = '';
    switch (level) {
      case 'excellent':
        feedback = 'Excellent explanation! You clearly understand the concepts and can articulate your reasoning.';
        break;
      case 'good':
        feedback = 'Good explanation. Consider adding more detail about tradeoffs or alternatives.';
        break;
      case 'partial':
        feedback = 'Partial explanation. Try to explain the "why" not just the "what".';
        break;
      case 'poor':
        feedback = 'Needs more detail. Explain your approach, the problem you solved, and any tradeoffs.';
        break;
    }

    return { score: Math.min(score, 100), feedback, level };
  },

  /**
   * Save challenge locally and to Supabase
   */
  async save(challenge: ReflectionChallenge): Promise<void> {
    // Save locally
    const challenges = this.getLocalChallenges();
    const existingIndex = challenges.findIndex(c => c.id === challenge.id);
    if (existingIndex >= 0) {
      challenges[existingIndex] = challenge;
    } else {
      challenges.push(challenge);
    }
    localStorage.setItem('CODEORBIT_REFLECTION_CHALLENGES', JSON.stringify(challenges));

    // Save to Supabase
    try {
      const { error } = await supabase
        .from('reflection_challenges')
        .upsert({
          id: challenge.id,
          user_id: challenge.userId,
          conversation_id: challenge.conversationId || null,
          milestone_id: challenge.milestoneId || null,
          type: challenge.type,
          prompt: challenge.prompt,
          context: challenge.context || null,
          status: challenge.status,
          response: challenge.response || null,
          score: challenge.score || null,
          feedback: challenge.feedback || null,
          created_at: challenge.createdAt,
          completed_at: challenge.completedAt || null,
        }, {
          onConflict: 'id',
        });
      if (error) console.warn('Supabase challenge save error:', error);
    } catch (err) {
      console.warn('Supabase challenge save failed:', err);
    }
  },

  /**
   * Save challenge locally (sync version)
   */
  saveLocal(challenge: ReflectionChallenge): void {
    const challenges = this.getLocalChallenges();
    const existingIndex = challenges.findIndex(c => c.id === challenge.id);
    if (existingIndex >= 0) {
      challenges[existingIndex] = challenge;
    } else {
      challenges.push(challenge);
    }
    localStorage.setItem('CODEORBIT_REFLECTION_CHALLENGES', JSON.stringify(challenges));
  },

  /**
   * Get local challenges
   */
  getLocalChallenges(): ReflectionChallenge[] {
    try {
      const raw = localStorage.getItem('CODEORBIT_REFLECTION_CHALLENGES');
      if (!raw) return [];
      return JSON.parse(raw) as ReflectionChallenge[];
    } catch {
      return [];
    }
  },

  /**
   * Get challenges for a user
   */
  getChallengesForUser(userId: string): ReflectionChallenge[] {
    return this.getLocalChallenges().filter(c => c.userId === userId);
  },

  /**
   * Get pending challenges for a user
   */
  getPendingChallenges(userId: string): ReflectionChallenge[] {
    return this.getChallengesForUser(userId).filter(c => c.status === 'pending');
  },

  /**
   * Get challenge statistics for a user
   */
  getStats(userId: string): {
    total: number;
    completed: number;
    pending: number;
    averageScore: number;
    byType: Record<ReflectionChallenge['type'], number>;
  } {
    const challenges = this.getChallengesForUser(userId);
    const completed = challenges.filter(c => c.status === 'completed');
    const scores = completed.filter(c => c.score !== undefined).map(c => c.score!);

    return {
      total: challenges.length,
      completed: completed.length,
      pending: challenges.filter(c => c.status === 'pending').length,
      averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      byType: {
        'post-paste': challenges.filter(c => c.type === 'post-paste').length,
        'post-milestone': challenges.filter(c => c.type === 'post-milestone').length,
        'concept-verification': challenges.filter(c => c.type === 'concept-verification').length,
        'random-verification': challenges.filter(c => c.type === 'random-verification').length,
      },
    };
  },
};
