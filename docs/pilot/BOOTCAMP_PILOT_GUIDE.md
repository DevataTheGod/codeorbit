# Bootcamp Pilot Guide

This guide explains how to run a CodeOrbit pilot with your bootcamp.

---

## Overview

### What is a Pilot?

A CodeOrbit pilot is a 4-6 week evaluation period where:

- Students use CodeOrbit for their projects
- Mentors review students and submit assessments
- We measure whether the Understanding Score correlates with mentor judgment

### Success Criteria

| Metric | Target |
|--------|--------|
| Mentor Correlation | 70%+ |
| Student Adoption | 80%+ |
| Mentor Satisfaction | 4/5+ |
| Score Trust | Mentors find scores useful |

---

## Pre-Pilot Setup

### 1. Account Setup

1. Create admin account at [codeorbit.app](https://codeorbit.app)
2. Create mentor accounts
3. Create student accounts (or invite students to sign up)

### 2. Role Assignment

- **Admin** — Bootcamp manager
- **Mentor** — Instructors who review students
- **Student** — Learners

### 3. Project Configuration

- Students create projects in CodeOrbit
- Mentors approve projects
- Orbit generates milestones

---

## Pilot Workflow

### Student Workflow

1. **Sign up** — Create account
2. **Submit project** — Describe what they want to build
3. **Get approved** — Mentor reviews and approves
4. **Use IDE** — Write code with Orbit guidance
5. **Complete milestones** — Finish tasks
6. **Answer reflections** — Explain their code when prompted
7. **Generate score** — Understanding Score calculated automatically

### Mentor Workflow

1. **Review submissions** — Approve/reject student projects
2. **Monitor progress** — View scores and milestones
3. **Review reflections** — Read student explanations
4. **Submit assessment** — Rank students (1-5) with confidence
5. **Provide feedback** — Send targeted guidance

### Admin Workflow

1. **Monitor dashboard** — View cohort metrics
2. **Manage users** — Assign roles as needed
3. **Track validation** — View correlation results
4. **Report results** — Export validation reports

---

## Duration

| Phase | Duration | Activities |
|-------|----------|------------|
| Setup | Week 1 | Account creation, onboarding |
| Active Learning | Weeks 2-5 | Students use CodeOrbit |
| Assessment | Week 6 | Mentors submit rankings |
| Analysis | Week 7 | Correlation calculation |
| Report | Week 8 | Results and decision |

---

## Metrics to Track

### Student Metrics

- Understanding Score (average, distribution)
- Reflection completion rate
- Milestone completion rate
- Paste events
- Time spent in IDE

### Mentor Metrics

- Assessment completion rate
- Confidence levels
- Correlation with system scores
- Time spent reviewing

### System Metrics

- Overall correlation percentage
- False positive rate
- False negative rate
- Score factor impact

---

## Validation Process

### Step 1: Collect Student Data

Students use CodeOrbit normally. The system collects:

- Telemetry (typing, paste, Orbit interactions)
- Reflection responses and scores
- Milestone completion
- Understanding Score

### Step 2: Collect Mentor Rankings

Mentors rank students **without seeing the system score**:

1. Open Mentor Dashboard
2. Review each student's work
3. Assign rank (1-5)
4. Set confidence level
5. Add notes
6. Save assessment

### Step 3: Calculate Correlation

The Validation Dashboard automatically calculates:

```
Correlation = (Max Delta - Sum of Deltas) / Max Delta × 100%
```

### Step 4: Analyze Results

| Correlation | Interpretation | Action |
|-------------|----------------|--------|
| 80%+ | Excellent | Proceed to production |
| 70-79% | Good | Minor tuning needed |
| 60-69% | Minimum | Significant improvements needed |
| <60% | Poor | Revisit algorithm design |

---

## Go/No-Go Criteria

### Go (Proceed to Production)

- Correlation ≥ 70%
- Student adoption ≥ 80%
- No critical security issues
- Mentor feedback positive

### No-Go (Continue Development)

- Correlation < 60%
- Significant student complaints
- Security vulnerabilities found
- Mentors don't trust the scores

---

## Support During Pilot

### Technical Support

- Email: support@codeorbit.app
- Response time: 24 hours

### Training

- Student onboarding guide (provided)
- Mentor training session (1 hour)
- Admin setup walkthrough (30 minutes)

### Feedback Collection

- Weekly check-ins with admin
- Student surveys (optional)
- Mentor feedback forms

---

## After the Pilot

### If Successful

1. Publish validation report
2. Onboard additional cohorts
3. Scale to multiple bootcamps
4. Begin production deployment

### If Unsuccessful

1. Analyze failure modes
2. Improve algorithm
3. Redesign score factors
4. Re-run pilot with changes

---

## Checklist

### Pre-Pilot

- [ ] Admin account created
- [ ] Mentor accounts created
- [ ] Student accounts created
- [ ] Roles assigned correctly
- [ ] Onboarding materials distributed
- [ ] Support channels established

### During Pilot

- [ ] Students actively using CodeOrbit
- [ ] Mentors reviewing regularly
- [ ] Reflections being answered
- [ ] Scores being generated
- [ ] No critical issues

### Post-Pilot

- [ ] All mentor assessments submitted
- [ ] Correlation calculated
- [ ] Results analyzed
- [ ] Report generated
- [ ] Go/No-Go decision made
