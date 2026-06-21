# Understanding Score Review

## Current Implementation

### Formula
```
Overall = Engagement × 0.3 + Explanation × 0.4 + Progress × 0.3
```

### Inputs

| Signal | Source | Weight | Implementation |
|--------|--------|--------|----------------|
| Engagement | useTelemetry hook | 30% | Orbit interactions, typing activity, task attempts |
| Explanation | ReflectionChallengeService | 40% | Reflection response quality (excellent/good/partial/poor) |
| Progress | Milestones completed | 30% | Milestones finished / total milestones |

### Risk Levels

| Score | Level | Action |
|-------|-------|--------|
| 90-100 | Mastery | No intervention needed |
| 75-89 | On Track | Monitor |
| 60-74 | At Risk | Mentor attention |
| 40-59 | Struggling | Intervention required |
| 0-39 | Critical | Immediate escalation |

### Persistence
- localStorage (primary)
- Supabase `understanding_scores` table (secondary)

---

## Assessment: Does It Measure Understanding?

### What It Actually Measures

| Signal | Measures | Proxy For |
|--------|----------|-----------|
| Paste events | Copy-paste behavior | Potential shortcut-taking |
| Typing patterns | Input speed | Manual coding effort |
| Reflection responses | Explanation quality | Conceptual understanding |
| Milestone completion | Task finishing | Progress |

### What It Does NOT Measure

| Missing Signal | Why It Matters |
|----------------|----------------|
| Code quality | Student could write bad code manually |
| Debugging ability | No tracking of error resolution |
| Concept application | Only tested via reflection, not implementation |
| Peer collaboration | No social learning signals |
| Time comprehension | Fast ≠ understood |

---

## Weaknesses

### 1. Gaming Risk
**Issue**: Student can memorize reflection answers
**Impact**: High
**Mitigation**: Randomize questions, add follow-up probes

### 2. False Positives
**Issue**: Student pastes own code from another editor
**Impact**: Medium
**Mitigation**: Allow "I wrote this" declaration with verification

### 3. False Negatives
**Issue**: Student types quickly but doesn't understand
**Impact**: Medium
**Mitigation**: Add concept verification challenges

### 4. Single Session Bias
**Issue**: Score only reflects current session
**Impact**: High
**Mitigation**: Implement score timeline, track across sessions

### 5. No Orbit Integration
**Issue**: Questions asked to Orbit not scored
**Impact**: High
**Mitigation**: Add Orbit interaction scoring

---

## Scoring Logic Issues

### Current Evaluation (ReflectionChallengeService)

```typescript
// Simplified scoring
if (responseLength < 20) score = 10;
else if (responseLength < 50) score = 30;
else if (responseLength < 100) score = 50;
else if (responseLength < 200) score = 70;
else score = 80;
```

**Problem**: Length ≠ understanding. A student can write 200 words of gibberish and get 80%.

### Recommended Fix

```typescript
// Quality-based scoring
const hasExplanation = /because|therefore|however|tradeoff/i.test(response);
const hasSpecifics = /component|function|variable|error/i.test(response);
const hasReasoning = /because|since|therefore|so that/i.test(response);

let score = 0;
if (hasExplanation) score += 30;
if (hasSpecifics) score += 30;
if (hasReasoning) score += 20;
if (responseLength > 50) score += 20;
```

---

## Version Roadmap

### V1 (Current)
- Basic formula (engagement + explanation + progress)
- Risk levels
- localStorage + Supabase persistence

### V2 (Recommended)
- Quality-based reflection scoring
- Orbit interaction scoring
- Score timeline
- Concept breakdown

### V3 (Future)
- ML-based scoring
- Predictive analytics
- Industry benchmarking
- Cross-bootcamp comparison

---

## Verdict

**Current Score Credibility: 55/100**

The score provides a rough signal but is too easily gamed and lacks depth. A mentor would see it as "interesting but not reliable enough to make decisions."

**To reach 80/100**, implement:
1. Quality-based reflection scoring
2. Orbit interaction tracking
3. Score timeline
4. Concept mastery breakdown
