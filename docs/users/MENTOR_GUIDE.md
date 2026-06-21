# Mentor Guide

Welcome to the CodeOrbit Mentor Portal. This guide explains how to review students, assess understanding, and provide effective mentorship.

---

## Getting Started

### 1. Access Requirements

- You must have a **Mentor** or **Admin** role
- Your account must be approved by an admin

### 2. Accessing the Dashboard

1. Sign in at [codeorbit.app](https://codeorbit.app)
2. You'll be redirected to the **Mentor Dashboard**

---

## Dashboard Overview

### Pending Submissions

Review new project submissions from students:

- View project details (title, description, tech stack)
- **Approve** — Student can start working
- **Reject** — Student needs to revise their submission

### Active Projects

Monitor students with approved projects:

- View progress percentage
- See understanding scores
- Review milestones and tasks

### Help Requests

Students can submit help requests. You can:

- View the request details
- Mark as resolved when addressed

---

## Understanding the Score

Each student has an **Understanding Score** that measures their comprehension.

### Score Breakdown

When you expand a student, you'll see:

| Factor | What It Measures |
|--------|------------------|
| **Engagement** | Orbit interactions, typing time, task attempts |
| **Reflection Quality** | How well they explain their code |
| **Progress** | Milestones completed vs. total |
| **Paste Penalty** | Deductions for excessive copy-pasting |

### Score Timeline

View the student's score history over time. This shows:

- Whether they're improving
- When scores changed
- Correlation with milestone completion

### Reflection History

See the student's actual responses to reflection challenges:

- The prompt they received
- Their response
- The score they received
- Feedback provided

This is critical for understanding **why** a student has a particular score.

---

## Mentor Assessment

For each student, you can submit your own assessment:

### 1. Rank the Student

Assign a rank from 1-5:

- **1** — Strongest student
- **5** — Weakest student

### 2. Set Confidence

Rate your confidence in this assessment:

- ★☆☆☆☆ — Guess
- ★★☆☆☆ — Low
- ★★★☆☆ — Medium
- ★★★★☆ — High
- ★★★★★ — Very confident

### 3. Add Notes

Explain your reasoning. This helps with:

- Future validation
- Algorithm improvement
- Student feedback

### 4. Save Assessment

Click **Save Assessment** to store your ranking in `mentor_validations`.

---

## Validation Dashboard

The Validation Dashboard shows cohort-level metrics:

### Cohort Metrics

- Total students
- Average understanding score
- Students at risk
- Total paste events

### Heuristic Validation Matrix

Pre-defined student profiles for testing:

- Student A (Strong)
- Student B (Copy-Paste)
- Student C (Average)
- Student D (Bypass Attempt)
- Student E (Mastery)

### Mentor Comparison

Compare your rankings against the system's Understanding Score:

1. Enter your rank for each student
2. View the correlation percentage
3. Export the report as CSV

### Success Criteria

| Correlation | Interpretation |
|-------------|----------------|
| 80%+ | Excellent — System aligns with mentor judgment |
| 70-79% | Good — Strong signal |
| 60-69% | Minimum viable — Continue validation |
| <60% | Needs improvement — Algorithm tuning required |

---

## Intervention Workflow

When a student is at risk:

1. **Review their score breakdown** — Identify weak areas
2. **Check reflection history** — Are they understanding concepts?
3. **Review their code** — Are they copy-pasting?
4. **Provide targeted feedback** — Use the Send Feedback button
5. **Monitor improvement** — Track score changes over time

---

## Best Practices

### Review Regularly

- Check the dashboard weekly
- Review reflection responses for quality
- Monitor score trends

### Be Specific in Feedback

- Reference specific milestones or tasks
- Explain what they did well and what needs improvement
- Suggest concrete next steps

### Trust the Score, But Verify

- The Understanding Score is a signal, not a verdict
- Always review the actual work
- Use your judgment alongside the score

---

## FAQ

### How often should I review students?

Weekly is recommended. Check for new submissions, help requests, and score changes.

### What if I disagree with the score?

Your mentor assessment helps validate the system. Enter your ranking and notes — this data improves the algorithm.

### Can I see all students?

Yes. The dashboard shows all students with mentor access enabled.

### How do I approve a student's project?

Go to Pending Submissions, review the project details, and click **Approve**.
