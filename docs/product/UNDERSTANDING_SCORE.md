# Understanding Score

The core differentiator. Quantified comprehension, not completion.

---

## Why It Exists

Bootcamps cannot verify whether students actually understand their work. The Understanding Score solves this by measuring comprehension across multiple dimensions.

---

## Formula

```
Overall = Engagement × 0.3 + Explanation × 0.4 + Progress × 0.3
```

**Explanation** has the highest weight (40%) because the ability to explain code is the strongest signal of understanding.

---

## Input Signals

### 1. Engagement (30%)

| Signal | Weight | Description |
|--------|--------|-------------|
| Orbit Interactions | 40% | Questions asked, responses given |
| Time Productive | 30% | Time spent coding (not idle) |
| Tasks Attempted | 20% | Tasks started vs completed |
| Help Requests | 10% | Appropriate use of support |

**Scoring**:
- 20+ Orbit interactions = full engagement score
- Quality matters: meaningful questions > random questions

### 2. Explanation Quality (40%)

| Signal | Weight | Description |
|--------|--------|-------------|
| Reflection Responses | 50% | Quality of code explanations |
| Concept Verification | 30% | Answers to concept questions |
| Code Documentation | 20% | Inline comments, README quality |

**Scoring Rubric**:

| Level | Criteria | Score |
|-------|----------|-------|
| Excellent | Explains concept clearly, mentions tradeoffs, shows depth | 90-100% |
| Good | Explains concept, minor gaps, shows understanding | 75-89% |
| Partial | Partial explanation, significant gaps | 50-74% |
| Poor | Cannot explain, guessing, or copying | 0-49% |

### 3. Progress (30%)

| Signal | Weight | Description |
|--------|--------|-------------|
| Milestones Completed | 50% | Milestones finished on time |
| Tasks Finished | 30% | Tasks completed per milestone |
| Project Advancement | 20% | Overall project progress |

**Scoring**:
- Completed milestones on time = full progress score
- Late completion = reduced score
- Incomplete milestones = low score

---

## Risk Levels

| Score | Level | Meaning |
|-------|-------|---------|
| 90-100% | Mastery | Student deeply understands, ready for interviews |
| 75-89% | On Track | Good understanding, minor gaps to address |
| 60-74% | At Risk | Partial understanding, needs mentor attention |
| 40-59% | Struggling | Significant gaps, requires intervention |
| 0-39% | Critical | Fundamental misunderstanding, escalate immediately |

---

## Concept Taxonomy

### React

| Concept | Verification Method |
|---------|---------------------|
| Component Lifecycle | Explain useEffect dependencies |
| State Management | Describe when to use useState vs useReducer |
| Props vs State | Differentiate data flow patterns |
| Hooks Rules | Explain why hooks can't be conditional |

### Node.js

| Concept | Verification Method |
|---------|---------------------|
| Event Loop | Explain async execution flow |
| Middleware | Describe request processing pipeline |
| Error Handling | Differentiate try-catch vs error middleware |
| Streams | Explain when to use streams vs buffers |

### Databases

| Concept | Verification Method |
|---------|---------------------|
| Normalization | Explain 1NF, 2NF, 3NF with examples |
| Indexing | Describe when to add/remove indexes |
| Transactions | Explain ACID properties |
| Joins | Differentiate INNER, LEFT, RIGHT joins |

---

## Telemetry Integration

### Signals Used

| Signal | Contribution |
|--------|--------------|
| Paste events | Negative signal (high paste = lower explanation score) |
| Typing patterns | Neutral signal (consistency check) |
| Time per task | Positive signal (productive time) |
| Code explanations | Positive signal (reflection quality) |

### Paste Detection

**Heuristic**: >30% new lines in <30 seconds = paste event (0.9 confidence)

**Impact**: Triggers reflection challenge, reduces explanation score until student explains pasted code.

---

## Mentor Reports

Generated after each validated milestone:

```json
{
  "milestoneName": "Authentication Setup",
  "understandingLevel": "medium",
  "overallScore": 72,
  "engagementScore": 80,
  "explanationScore": 65,
  "progressScore": 70,
  "conceptMastery": {
    "JWT": 85,
    "Session Management": 60,
    "Password Hashing": 75
  },
  "strengths": ["Clear API design", "Good error handling"],
  "weakAreas": ["JWT token refresh", "Session management"],
  "redFlags": ["Copied auth middleware from Stack Overflow"],
  "recommendation": "Schedule 1:1 on JWT patterns"
}
```

---

## Future Evolution

### Phase 1 (Current)
- Manual scoring based on reflection responses
- Basic engagement tracking
- Simple risk levels

### Phase 2
- ML-based scoring refinement
- Automated concept detection
- Predictive analytics

### Phase 3
- Industry benchmarking
- Cross-bootcamp comparisons
- Certification integration

---

## Implementation Status

| Component | Status |
|-----------|--------|
| Score formula | Defined |
| Engagement tracking | Basic |
| Explanation scoring | Manual |
| Progress tracking | Implemented |
| Risk assessment | Defined |
| Concept taxonomy | Defined |
| Dashboard | Not implemented |

---

*This document defines the Understanding Score system. Implementation should follow the formula and signals defined here.*
