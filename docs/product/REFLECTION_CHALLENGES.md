# Reflection Challenges

The bridge between telemetry and understanding.

---

## Why It Exists

Reflection Challenges force students to explain their work in their own words, verifying comprehension and detecting AI-assisted learning.

---

## Challenge Types

### 1. Post-Paste Challenge

**Trigger**: Student pastes code (>30% new lines in <30 seconds)

**Response**:
```
"I notice you pasted code. Can you explain what this does in your own words?"
```

**Purpose**: Verify student understands pasted code, not just copying.

**Scoring Impact**: Explanation score reduced until student provides satisfactory explanation.

---

### 2. Post-Milestone Challenge

**Trigger**: Student completes a milestone

**Response**:
```
"You've completed [Milestone Name]. Describe your implementation approach.
What tradeoffs did you consider? What would you do differently?"
```

**Purpose**: Verify student understands what they built, not just that they finished.

**Scoring Impact**: Explanation score updated based on response quality.

---

### 3. Concept Verification Challenge

**Trigger**: Orbit detects concept usage in conversation

**Response**:
```
"You mentioned [concept]. Can you explain the difference between [X] and [Y]?
When would you use each?"
```

**Purpose**: Verify student understands concepts, not just syntax.

**Scoring Impact**: Concept mastery updated based on response quality.

---

### 4. Random Verification Challenge

**Trigger**: Periodic check (every 2-3 interactions)

**Response**:
```
"Quick check: Can you explain what [recent code] does without looking at it?"
```

**Purpose**: Verify retention and understanding.

**Scoring Impact**: Engagement score updated based on response quality.

---

## Response Scoring

### Rubric

| Level | Criteria | Score |
|-------|----------|-------|
| Excellent | Explains clearly, mentions tradeoffs, shows depth | 90-100% |
| Good | Explains concept, minor gaps | 75-89% |
| Partial | Partial explanation, significant gaps | 50-74% |
| Poor | Cannot explain, guessing, copying | 0-49% |

### What Counts as "Excellent"

- Explains the "why" not just the "what"
- Mentions alternatives considered
- Identifies potential issues or improvements
- Uses correct terminology
- Shows understanding of tradeoffs

### What Counts as "Poor"

- Restates code without explanation
- Uses vague language ("it does the thing")
- Cannot answer follow-up questions
- Appears to be reading from documentation
- Shows signs of copying

---

## Workflow

### Detection Flow

```
1. Student writes/pastes code
2. Telemetry monitors for triggers
3. Trigger detected (paste, milestone, concept, random)
4. Challenge generated
5. Student responds
6. Response scored
7. Understanding Score updated
8. Mentor notified if risk level changes
```

### Escalation Flow

```
1. Student receives challenge
2. Student attempts response
3. If response is "Poor":
   a. Second attempt allowed
   b. If still "Poor": Escalate to mentor
   c. Mentor notified with context
4. If response is "Excellent":
   a. Concept mastery updated
   b. Positive reinforcement
   c. Continue to next challenge
```

---

## Integration with Orbit

### Orbit's Role

1. **Detect**: Monitor student interactions for triggers
2. **Challenge**: Generate appropriate reflection prompts
3. **Evaluate**: Score student responses
4. **Report**: Update Understanding Score, notify mentor

### Orbit's Constraints

- Never provide answers to reflection challenges
- Never explain concepts during challenges
- Focus on verification, not teaching during challenges
- Maintain Socratic method even in challenges

---

## Mentor Integration

### Mentor Dashboard View

```
Student: Sarah Chen
Recent Challenges:
├── Post-Paste (2 hours ago): "Explain the JWT middleware"
│   Response: Excellent (92%)
│   Concept: JWT, Authentication
│
├── Post-Milestone (yesterday): "Describe your API design"
│   Response: Good (78%)
│   Concepts: REST, HTTP Methods
│
└── Concept Verification (3 days ago): "Explain useState vs useEffect"
    Response: Partial (55%)
    Concept: React Hooks → NEEDS ATTENTION
```

### Mentor Actions

- Review challenge responses
- Provide additional explanation for "Poor" responses
- Update concept mastery manually if needed
- Schedule 1:1 for struggling concepts

---

## Anti-Cheating Integration

### Paste Detection

**Signal**: High paste-to-code ratio

**Challenge**: "I notice you've pasted several code blocks. Can you explain the overall architecture of what you've built?"

**Purpose**: Verify student understands the whole, not just parts.

### AI Detection

**Signal**: Responses that appear AI-generated

**Challenge**: "That's a good explanation. Can you give me a specific example from your code that demonstrates this?"

**Purpose**: Verify student can connect explanation to actual implementation.

---

## Implementation Status

| Component | Status |
|-----------|--------|
| Post-Paste Challenge | Defined |
| Post-Milestone Challenge | Defined |
| Concept Verification | Defined |
| Random Verification | Defined |
| Scoring Rubric | Defined |
| Mentor Integration | Defined |
| Anti-Cheating | Defined |
| **Actual Implementation** | **Not Started** |

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Challenge Response Rate | 90%+ |
| Average Response Score | 75%+ |
| Mentor Intervention Rate | < 20% |
| Concept Mastery Improvement | 10%+ per month |

---

*This document defines the Reflection Challenges system. Implementation should follow the triggers and scoring defined here.*
