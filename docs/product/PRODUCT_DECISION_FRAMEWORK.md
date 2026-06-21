# Product Decision Framework

Every feature request, improvement, or new capability must pass through this filter before implementation.

---

## Primary Questions

Every feature must answer **YES** to at least one:

| Question | If YES | If NO |
|----------|--------|-------|
| Does this improve **understanding verification**? | Proceed | Consider carefully |
| Does this improve **mentor efficiency**? | Proceed | Consider carefully |
| Does this improve **student learning outcomes**? | Proceed | Consider carefully |
| Does this improve **placement success**? | Proceed | Consider carefully |

If NO to all four: **Don't build it.**

---

## Secondary Questions

After passing primary filter, evaluate:

| Question | Weight |
|----------|--------|
| Does this scale to 100+ students per mentor? | High |
| Does this reduce mentor workload? | High |
| Does this improve Understanding Score accuracy? | High |
| Does this detect AI-assisted learning? | Medium |
| Does this reduce bootcamp operational cost? | Medium |
| Does this improve student engagement? | Medium |
| Is this technically feasible with current stack? | Medium |
| Does this create vendor lock-in? | Low (acceptable for MVP) |

---

## Red Flags — Never Build

Features that trigger immediate rejection:

| Red Flag | Why |
|----------|-----|
| Features that help students cheat | Undermines core mission |
| Features that replace mentors | Mentors are the product, not the problem |
| Features that generate code for students | Orbit NEVER writes solutions |
| Features that focus on IDE complexity | IDE is supporting infrastructure, not the moat |
| Features that optimize for "time spent" | Time spent ≠ learning |
| Features that add passive content (videos, docs) | We believe in active learning |

---

## Priority Order

When resources are limited, build in this order:

```
1. Understanding Score System
2. Reflection Challenges
3. Mentor Dashboard
4. Orbit Mentor (Socratic AI)
5. Project Roadmap Generator
6. Telemetry Engine
7. Browser IDE
```

**Rationale**: Items 1-4 are the moat. Items 5-6 support the moat. Item 7 is infrastructure.

---

## Decision Matrix Template

For each feature request, fill out:

```markdown
## Feature: [Name]

### Primary Benefit
- [ ] Understanding verification
- [ ] Mentor efficiency
- [ ] Student learning
- [ ] Placement success

### Priority Level
- [ ] Critical (blocks core workflow)
- [ ] High (significantly improves value)
- [ ] Medium (nice to have)
- [ ] Low (future consideration)

### Effort Estimate
- [ ] Small (< 1 week)
- [ ] Medium (1-4 weeks)
- [ ] Large (1-3 months)
- [ ] Epic (3+ months)

### Decision
- [ ] APPROVE — Aligns with mission
- [ ] DEFER — Good but not now
- [ ] REJECT — Doesn't pass filter
- [ ] REDESIGN — Concept is right, execution is wrong

### Rationale
[Why this decision?]
```

---

## Feature Request Triage

When a new feature request arrives:

1. **Does it pass the primary filter?** → If no, reject or redesign
2. **Is it in the current priority order?** → If not, defer
3. **What's the effort estimate?** → If large, break into smaller pieces
4. **Does it conflict with existing features?** → If yes, resolve conflict
5. **Can it be tested with users?** → If yes, add to pilot

---

## Anti-Patterns to Watch

| Pattern | Problem | Solution |
|---------|---------|----------|
| "Let's add a video player" | Passive content, not active learning | Add reflection challenges instead |
| "Let's improve the IDE" | IDE is not the moat | Focus on Understanding Score |
| "Let's add gamification" | Time spent ≠ learning | Focus on verification metrics |
| "Let's add AI code generation" | Undermines Socratic method | Never generate code for students |
| "Let's add more admin features" | Admin ≠ core value | Focus on mentor intelligence |

---

*This framework protects CodeOrbit from feature creep and ensures every development decision serves the core mission: Engineering Judgment Verification.*
