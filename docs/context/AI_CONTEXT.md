# AI Context

Everything Orbit-related.

---

## Orbit Overview

Orbit is the Socratic AI mentor that guides students through project-based learning using the Socratic method—asking clarifying questions, pointing out conceptual gaps, and refusing to provide direct code solutions.

---

## Socratic Method

**Core Principle**: Force thinking, not copying.

**How It Works**:
1. Student asks a question
2. Orbit responds with clarifying questions
3. Student must think through the problem
4. Orbit guides toward understanding
5. Student arrives at solution independently

**Example**:
```
Student: "How do I implement JWT authentication?"
Orbit: "What data needs to be protected? What are the common ways to verify identity? What happens if the token expires?"
```

**Never**:
```
Orbit: "Here's the code: bcryptjs.hash(password, saltRounds)"
```

---

## Prompt Architecture

### System Prompt Location
`supabase/functions/orbit-chat/index.ts`

### 9 Mandates

1. **NO-EXECUTION RULE**: Never provide full code blocks or complete implementations
2. **CLARIFY & INTAKE**: Collect project idea, tech stack, skill level, timeline before proceeding
3. **MILESTONE CREATION**: Produce ordered, sequential milestones with measurable success criteria
4. **MILESTONE DETAILS FORMAT**: Include objective, concepts, expected output, file structure, success criteria
5. **GUIDANCE STYLE**: Step-wise thinking guidance with hints and leading questions
6. **PROGRESS VALIDATION**: Ask what student implemented, check logical consistency, point out gaps
7. **MENTOR FEEDBACK REPORT**: Generate JSON summary with understanding level, strengths, weak areas, red flags
8. **ANTI-SHORTCUT ENFORCEMENT**: Halt if student tries to skip milestones or paste large code blocks
9. **TONE**: Professional, encouraging, patient—never condescending

---

## Reflection Challenges

### Triggers

| Trigger | Response |
|---------|----------|
| **Post-Paste** | "I notice you pasted code. Can you explain what this does in your own words?" |
| **Post-Milestone** | "Describe your implementation approach. What tradeoffs did you consider?" |
| **Concept Verification** | "What is the difference between X and Y? When would you use each?" |

### Scoring

Responses scored against rubric:
- **Excellent**: Explains concept clearly, mentions tradeoffs, shows understanding
- **Good**: Explains concept, minor gaps
- **Partial**: Partial explanation, significant gaps
- **Poor**: Cannot explain, guessing, or copying

---

## Telemetry Integration

### Signals Collected

| Signal | Purpose |
|--------|---------|
| Paste events | Detect copy-paste behavior |
| Paste-to-code ratio | Measure code originality |
| Typing patterns | Detect automated input |
| Time per task | Measure engagement |
| Code explanations | Verify understanding |

### Paste Detection

**Heuristic**: If >30% new lines appear in <30 seconds, flag as paste with 0.9 confidence.

**Response**: Triggers reflection challenge and score update.

---

## Anti-Cheating Philosophy

**Goal**: Create audit trail of genuine learning.

**Methods**:
1. **Behavioral Telemetry**: Typing patterns, paste events, time spent
2. **Cognitive Verification**: Reflection challenges, code explanations
3. **Understanding Score**: Quantified comprehension over time
4. **Mentor Reports**: AI-generated summaries for human oversight

**What We Don't Do**:
- Block copy-paste (students need to reference docs)
- Monitor keystrokes invasively
- Replace human judgment (mentors make final decisions)

---

## Understanding Score Inputs

```
Overall = Engagement × 0.3 + Explanation × 0.4 + Progress × 0.3
```

### Engagement (30%)
- Orbit interactions (questions asked, responses given)
- Time spent in platform (productive time only)
- Tasks attempted vs. completed

### Explanation (40%)
- Reflection challenge responses
- Code explanation quality
- Concept verification answers

### Progress (30%)
- Milestones completed
- Tasks finished
- Project advancement

---

## AI Provider

**Current**: Gemini 2.5 Flash via Lovable AI Gateway

**Endpoint**: `https://ai.gateway.lovable.dev/v1/chat/completions`

**Environment Variable**: `LOVABLE_API_KEY`

**Note**: Not Claude. See `docs/strategy/TARGET_ARCHITECTURE.md` for aspirational architecture.

---

## Mentor Reports

Generated after each validated milestone:

```json
{
  "milestoneName": "Authentication Setup",
  "understandingLevel": "medium",
  "strengths": ["Clear API design", "Good error handling"],
  "weakAreas": ["JWT token refresh", "Session management"],
  "redFlags": ["Copied auth middleware from Stack Overflow"],
  "recommendation": "Schedule 1:1 on JWT patterns"
}
```

---

## Future Expansion

| Phase | Capability |
|-------|------------|
| Now | JS/TS, React, Node.js, SQL, REST APIs |
| Later | Python, Django, FastAPI |
| Later | Java, Spring Boot |
| Later | Other frameworks |

---

*This document defines how Orbit works as an AI system. All prompt changes should maintain the 9 mandates.*
