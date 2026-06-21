# CodeOrbit: Technical Architecture & System Design

---

## SECTION 1: SYSTEM ARCHITECTURE OVERVIEW

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                              │
├─────────────────────────────────────────────────────────────────┤
│  React Frontend (Monaco Editor, Dashboards, Chat)              │
│  - Student IDE Interface                                        │
│  - Mentor Dashboard                                             │
│  - Orbit Chat Interface                                         │
│  - Admin Panel                                                  │
└──────────────┬──────────────────────────────────────────────────┘
               │ HTTPS / REST / WebSocket
┌──────────────▼──────────────────────────────────────────────────┐
│                        API TIER                                 │
├─────────────────────────────────────────────────────────────────┤
│  Node.js + Express Server                                       │
│  ├─ Auth & Session Management                                   │
│  ├─ User Management (Students, Mentors, Bootcamps)             │
│  ├─ Project Management API                                      │
│  ├─ Submission Handling                                         │
│  ├─ Chat/Orbit Integration                                      │
│  └─ Dashboard Data Endpoints                                    │
└──────┬──────────────────┬──────────────────┬────────────────────┘
       │                  │                  │
       │                  │                  │
┌──────▼──────┐  ┌────────▼────────┐  ┌─────▼──────────┐
│              │  │                 │  │                │
│  PostgreSQL  │  │  Telemetry /   │  │  Claude API    │
│  Database    │  │  Analytics     │  │  (Orbit        │
│              │  │  Engine        │  │  Mentor)       │
│              │  │                 │  │                │
└──────────────┘  └─────────────────┘  └────────────────┘
       │
       │  Connection Pool
       │
       └─── Redis Cache / Session Store

┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE TIER                               │
├─────────────────────────────────────────────────────────────────┤
│  ├─ Orbit AI Service (Socratic Mentor)                         │
│  ├─ Understanding Score Calculator                              │
│  ├─ Telemetry Processor (Paste detection, code analysis)       │
│  ├─ Roadmap Generator                                           │
│  ├─ Notification Service                                        │
│  └─ File Storage Service                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE TIER                          │
├─────────────────────────────────────────────────────────────────┤
│  AWS Services:                                                  │
│  ├─ EC2 (Compute)                                               │
│  ├─ RDS PostgreSQL (Database)                                   │
│  ├─ ElastiCache (Redis)                                         │
│  ├─ S3 (File Storage)                                           │
│  ├─ CloudFront (CDN)                                            │
│  ├─ SQS (Message Queue)                                         │
│  └─ Lambda (Async Tasks)                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Scalability:** System designed to handle 10,000+ concurrent students
2. **Real-time:** Understanding scores update within minutes of submission
3. **Reliability:** 99.9% uptime SLA
4. **Security:** All user data encrypted, PII protected
5. **Simplicity:** Minimal moving parts; easy to maintain and deploy

---

## SECTION 2: FRONTEND ARCHITECTURE

### Tech Stack
- **Framework:** React 18 + TypeScript
- **State Management:** TanStack Query + Zustand
- **Code Editor:** Monaco Editor
- **Styling:** Tailwind CSS
- **Testing:** Vitest + React Testing Library
- **Build:** Vite

### Key Pages/Components

#### Student Interface

**Project Setup Page:**
```
┌─────────────────────────────────────────┐
│  Create New Project                     │
├─────────────────────────────────────────┤
│  Project Goal: [text input]             │
│  Tech Stack: [dropdown: React/Node...]  │
│  Timeline: [8 weeks]                    │
│  Difficulty: [Beginner/Intermediate]    │
│  Generate Roadmap ► [button]            │
└─────────────────────────────────────────┘
```

**IDE Page:**
```
┌─────────────────────────────────────────────────┐
│ Files              │  Editor  │  Chat (Orbit)  │
├────────────────────┼──────────┼────────────────┤
│ src/               │          │                │
│  └─ App.jsx   [✎] │  Current │ You: How do I  │
│  └─ index.jsx     │  File    │ handle form    │
│ public/            │  Content │ state?         │
│ package.json       │          │ Orbit: What... │
│                    │          │ [input field]  │
└────────────────────┴──────────┴────────────────┘
        [Save] [Submit Milestone] [View Roadmap]
```

**Mentor Dashboard:**
```
┌──────────────────────────────────────────────────┐
│ Cohort: Batch 2024-Q1 (50 students)             │
├──────────────────────────────────────────────────┤
│ Sort: Understanding Score ▼  Filter: All ▼      │
├──────────────────────────────────────────────────┤
│ Student      │ Progress │ Understanding │ Status│
├──────────────┼──────────┼───────────────┼───────┤
│ Sarah Chen   │   72%    │     84%       │ ✓     │
│ Raj Patel    │   65%    │     71%       │ ⚠️    │
│ Vikas Kumar  │   45%    │     58%       │ ⛔   │
│ ...          │   ...    │     ...       │ ...   │
└──────────────┴──────────┴───────────────┴───────┘
        [View Details] [Send Feedback] [Schedule 1:1]
```

### State Management

```typescript
// Zustand stores
- authStore (user auth, login state)
- projectStore (current project, roadmap)
- submissionStore (student submissions)
- telemetryStore (local telemetry before sending)

// TanStack Query hooks
- useStudents() // for mentor dashboard
- useProjectProgress()
- useUnderstandingScore()
- useOrbitMessages()
```

### API Integration

```typescript
// RESTful endpoints the frontend calls
POST   /api/auth/login
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id/submit-milestone
GET    /api/understanding-score/:studentId
GET    /api/mentor/cohort/:cohortId
POST   /api/orbit/message
GET    /api/mentor/dashboard
```

### Performance Optimization

- **Code Splitting:** Lazy load routes
- **Image Optimization:** Next/Image equivalent
- **Caching:** TanStack Query caches API responses
- **Compression:** Gzip enabled
- **CDN:** CloudFront caches static assets

---

## SECTION 3: BACKEND API ARCHITECTURE

### Technology Stack
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Authentication:** JWT + refresh tokens
- **Validation:** Zod
- **Testing:** Jest + Supertest

### API Structure

```
/src
├── controllers/
│   ├── authController.ts
│   ├── projectController.ts
│   ├── submissionController.ts
│   ├── orbitController.ts
│   ├── dashboardController.ts
│   └── userController.ts
├── services/
│   ├── orbitService.ts (Claude API integration)
│   ├── understandingScoreService.ts
│   ├── telemetryService.ts
│   ├── roadmapService.ts
│   └── authService.ts
├── middleware/
│   ├── auth.ts
│   ├── errorHandler.ts
│   ├── logging.ts
│   ├── rateLimit.ts
│   └── validation.ts
├── routes/
│   ├── auth.ts
│   ├── projects.ts
│   ├── submissions.ts
│   ├── orbit.ts
│   ├── dashboard.ts
│   └── admin.ts
├── models/
│   ├── User.ts
│   ├── Project.ts
│   ├── Submission.ts
│   ├── UnderstandingScore.ts
│   └── Telemetry.ts
└── utils/
    ├── validators.ts
    ├── errors.ts
    └── logger.ts
```

### Key Endpoints

#### Authentication
```
POST /api/auth/register
  Input: email, password, role (student|mentor|founder)
  Output: user, token, refresh_token

POST /api/auth/login
  Input: email, password
  Output: user, token, refresh_token

POST /api/auth/refresh
  Input: refresh_token
  Output: new_token

POST /api/auth/logout
  Input: token
  Output: success
```

#### Projects
```
POST /api/projects
  Input: projectName, goal, techStack, timeline
  Output: project, roadmap (auto-generated)

GET /api/projects/:id
  Output: project details, roadmap, progress

PUT /api/projects/:id/update
  Input: updates
  Output: updated project

GET /api/student/projects
  Output: [projects for logged-in student]
```

#### Submissions
```
POST /api/projects/:id/submit-milestone
  Input: milestoneNumber, code, explanation
  Output: submission, understanding_score_update

GET /api/projects/:id/submissions
  Output: [all submissions for project]

GET /api/mentor/submissions/:cohortId
  Output: [all submissions in cohort, with scores]
```

#### Orbit (AI Mentor)
```
WebSocket /ws/orbit/:projectId
  - Bidirectional chat with Orbit
  - Messages streamed in real-time
  - Telemetry captured per message

POST /api/orbit/message
  Input: message, projectId, codeContext
  Output: orbitResponse, telemetryLog
```

#### Understanding Score
```
GET /api/understanding-score/:studentId
  Output: { overall: 75, engagement: 80, explanation: 70, progress: 75, concepts: {...} }

GET /api/understanding-score/:cohortId/all
  Output: [scores for all students in cohort]

GET /api/understanding-score/:studentId/history
  Output: [historical scores over time]
```

#### Mentor Dashboard
```
GET /api/mentor/dashboard/:cohortId
  Output: cohort overview, students list, metrics

GET /api/mentor/student/:studentId
  Output: detailed student view, all submissions, scores

POST /api/mentor/send-feedback
  Input: studentId, feedback
  Output: feedback created

POST /api/mentor/schedule-session
  Input: studentId, time
  Output: session scheduled
```

### Error Handling

```typescript
// Standardized error format
{
  error: {
    code: "SUBMISSION_VALIDATION_FAILED",
    message: "Code failed syntax validation",
    details: {...}
  }
}

// Custom error classes
- ValidationError (400)
- AuthenticationError (401)
- AuthorizationError (403)
- NotFoundError (404)
- InternalServerError (500)
```

### Authentication & Authorization

```typescript
// JWT Structure
{
  sub: userId,
  role: "student|mentor|founder",
  cohortId: cohortId,
  iat: timestamp,
  exp: timestamp + 1hr
}

// Role-based Access Control
- Students can only see their own projects
- Mentors can see their assigned cohorts
- Founders can see all data for their bootcamp
- Admins can see everything
```

---

## SECTION 4: DATABASE SCHEMA

### PostgreSQL Schema

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('student', 'mentor', 'founder', 'admin'),
  bootcamp_id UUID REFERENCES bootcamps(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bootcamps Table
CREATE TABLE bootcamps (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  region ENUM('india', 'us', 'eu'),
  contact_email VARCHAR(255),
  student_count INT,
  mentor_count INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cohorts Table
CREATE TABLE cohorts (
  id UUID PRIMARY KEY,
  bootcamp_id UUID NOT NULL REFERENCES bootcamps(id),
  name VARCHAR(255),
  start_date DATE,
  end_date DATE,
  student_count INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CohortEnrollments (many-to-many: students in cohorts)
CREATE TABLE cohort_enrollments (
  id UUID PRIMARY KEY,
  cohort_id UUID NOT NULL REFERENCES cohorts(id),
  student_id UUID NOT NULL REFERENCES users(id),
  status ENUM('active', 'completed', 'dropped'),
  enrolled_at TIMESTAMP DEFAULT NOW()
);

-- Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES users(id),
  cohort_id UUID NOT NULL REFERENCES cohorts(id),
  project_name VARCHAR(255) NOT NULL,
  goal TEXT,
  tech_stack TEXT, -- JSON: ["React", "Node.js", "PostgreSQL"]
  timeline_weeks INT,
  difficulty ENUM('beginner', 'intermediate', 'advanced'),
  roadmap JSONB, -- Serialized roadmap structure
  status ENUM('in_progress', 'submitted', 'reviewed'),
  created_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  reviewed_at TIMESTAMP
);

-- Milestones Table
CREATE TABLE milestones (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id),
  milestone_number INT,
  title VARCHAR(255),
  description TEXT,
  expected_completion_date DATE,
  submission_date TIMESTAMP,
  status ENUM('not_started', 'in_progress', 'submitted', 'reviewed'),
  mentor_feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Submissions Table
CREATE TABLE submissions (
  id UUID PRIMARY KEY,
  milestone_id UUID NOT NULL REFERENCES milestones(id),
  student_id UUID NOT NULL REFERENCES users(id),
  code_content JSONB, -- { "fileName": "content" }
  explanation TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);

-- Reflections Table (Student Explanations)
CREATE TABLE reflections (
  id UUID PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES submissions(id),
  student_id UUID NOT NULL REFERENCES users(id),
  prompt TEXT, -- "Why did you choose this approach?"
  response TEXT, -- Student's answer
  response_score INT, -- 0-100
  is_genuine BOOLEAN, -- Mentor review
  mentor_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ConversationHistory Table (Orbit Chat)
CREATE TABLE conversation_history (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id),
  student_id UUID NOT NULL REFERENCES users(id),
  message_sequence INT,
  student_message TEXT,
  orbit_response TEXT,
  response_quality INT, -- 1-5 rating
  telemetry JSONB, -- { "pastedCode": true, "conceptsAsked": [...] }
  created_at TIMESTAMP DEFAULT NOW()
);

-- Telemetry Table (Events)
CREATE TABLE telemetry (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES users(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  event_type ENUM('paste', 'save', 'explanation', 'question', 'milestone_submit'),
  event_data JSONB, -- Flexible structure
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX (student_id, created_at),
  INDEX (project_id, created_at)
);

-- UnderstandingScore Table
CREATE TABLE understanding_scores (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES users(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  overall_score INT, -- 0-100
  engagement_score INT, -- Based on Orbit interactions
  explanation_score INT, -- Based on reflection quality
  progress_score INT, -- Based on milestones completed
  concept_breakdown JSONB, -- { "React": 85, "State": 72, ... }
  calculated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX (student_id),
  INDEX (project_id),
  INDEX (calculated_at DESC)
);

-- MentorFeedback Table
CREATE TABLE mentor_feedback (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES users(id),
  mentor_id UUID NOT NULL REFERENCES users(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  feedback_text TEXT,
  category ENUM('concept_gap', 'code_quality', 'explanation', 'progress'),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Key Indexes (for performance)

```sql
-- Fast lookups for common queries
CREATE INDEX idx_projects_student ON projects(student_id, cohort_id);
CREATE INDEX idx_projects_cohort ON projects(cohort_id);
CREATE INDEX idx_understanding_student_time ON understanding_scores(student_id, calculated_at DESC);
CREATE INDEX idx_telemetry_student_time ON telemetry(student_id, created_at DESC);
CREATE INDEX idx_submissions_milestone ON submissions(milestone_id);
```

---

## SECTION 5: AI/ORBIT SERVICE ARCHITECTURE

### Orbit Mentor Service

**Purpose:** Provide Socratic guidance without generating solutions

**Components:**

```typescript
// orbitService.ts

interface OrbitRequest {
  studentQuestion: string;
  projectContext: {
    projectName: string;
    techStack: string[];
    currentMilestone: string;
  };
  conversationHistory: Message[];
  codeContext?: string; // If student pastes code
}

interface OrbitResponse {
  response: string;
  isCodeGeneration: boolean; // Should always be false
  questionsAsked: string[];
  conceptsReferenced: string[];
  telemetry: TelemetryEvent;
}

class OrbitService {
  async getGuidance(request: OrbitRequest): Promise<OrbitResponse> {
    // 1. Validate input (no code generation requests)
    // 2. Build context for Claude
    // 3. Call Claude with specific prompt
    // 4. Parse response
    // 5. Log telemetry
    // 6. Return response
  }
}
```

**System Prompt for Orbit:**

```
You are Orbit, an AI mentor for students learning software engineering.
Your role is to guide students toward understanding WITHOUT giving them code solutions.

RULES YOU MUST FOLLOW:
1. NEVER generate complete code solutions
2. NEVER provide ready-to-copy code snippets
3. ALWAYS ask clarifying questions before explaining concepts
4. ALWAYS encourage the student to think for themselves
5. ALWAYS acknowledge good questions and effort

WHEN A STUDENT ASKS A QUESTION:
- Ask: "What have you tried so far?"
- Ask: "What error are you seeing?"
- Ask: "Why do you think that approach would work?"
- Explain the concept in simple terms
- Give examples of the concept (not the solution)
- Suggest where to look (docs, tutorials) but don't copy-paste

WHEN A STUDENT PASTES CODE:
- Acknowledge the paste detection
- Ask: "Can you explain what this code does?"
- Ask: "Why did you choose this implementation?"
- If they can't explain: "Let's break this down step by step..."

WHEN A STUDENT IS STUCK:
- Ask: "What's the smallest step forward?"
- Suggest a different angle or tool
- Point toward documentation
- Offer a Socratic question instead of an answer

Remember: Your goal is to develop engineering judgment, not provide quick fixes.
```

**Response Safety Checks:**

```typescript
function validateOrbitResponse(response: string): boolean {
  // Fail if response looks like it's generating code
  const codePatterns = [
    /const\s+\w+\s*=\s*\(/,  // Variable assignment with function
    /function\s+\w+\(/,       // Function declaration
    /import\s+\{/,            // Import statement
    /export\s+/,              // Export statement
  ];
  
  for (const pattern of codePatterns) {
    if (pattern.test(response)) {
      return false; // FAIL: This looks like code generation
    }
  }
  return true; // PASS: Safe to send to student
}
```

---

## SECTION 6: UNDERSTANDING SCORE CALCULATOR

### Algorithm Overview

**Understanding Score = Engagement + Explanation + Progress**

```typescript
interface UnderstandingScore {
  overall: number; // 0-100
  engagement: number; // 30% weight
  explanation: number; // 40% weight
  progress: number; // 30% weight
  conceptBreakdown: { [concept: string]: number };
}

function calculateUnderstandingScore(data: {
  orbitInteractions: number;
  reflectionQuality: number[];
  milestonesCompleted: number;
  totalMilestones: number;
  conceptScores: { [concept: string]: number };
}): UnderstandingScore {
  
  // Engagement Score (interaction with Orbit)
  const engagement = Math.min(
    (data.orbitInteractions / 20) * 100,  // Expect ~20 quality questions
    100
  );
  
  // Explanation Score (quality of reflections)
  const explanationAvg = data.reflectionQuality.length > 0
    ? data.reflectionQuality.reduce((a, b) => a + b) / data.reflectionQuality.length
    : 0;
  const explanation = explanationAvg; // 0-100
  
  // Progress Score (milestones completed)
  const progress = (data.milestonesCompleted / data.totalMilestones) * 100;
  
  // Weighted overall
  const overall = (engagement * 0.3) + (explanation * 0.4) + (progress * 0.3);
  
  return {
    overall: Math.round(overall),
    engagement: Math.round(engagement),
    explanation: Math.round(explanation),
    progress: Math.round(progress),
    conceptBreakdown: data.conceptScores,
  };
}
```

### Concept Breakdown

For each concept, track student mastery:

```typescript
// Tracked concepts per tech stack
const CONCEPT_TAXONOMY = {
  react: [
    "Components",
    "JSX Syntax",
    "State Management",
    "Props",
    "Hooks",
    "Lifecycle",
    "Conditional Rendering",
    "Lists & Keys"
  ],
  nodejs: [
    "HTTP Basics",
    "Express Routing",
    "Middleware",
    "Request/Response",
    "Error Handling",
    "Async/Await"
  ],
  databases: [
    "Tables & Relationships",
    "SQL Queries",
    "Joins",
    "Indexes",
    "Transactions",
    "Data Normalization"
  ]
};

// Track concept mastery per student
interface ConceptMastery {
  conceptName: string;
  score: number; // 0-100
  questionsAsked: number;
  explanationsGiven: number;
  projectsWhereTaught: string[];
  lastSeen: Date;
}
```

---

## SECTION 7: TELEMETRY & PASTE DETECTION

### Telemetry Events

```typescript
interface TelemetryEvent {
  studentId: string;
  projectId: string;
  eventType: 'paste' | 'save' | 'explanation' | 'question' | 'milestone_submit';
  timestamp: Date;
  metadata: {
    // For 'paste' events
    pasteLength?: number;
    pasteSource?: string; // "external_code", "github", "stackoverflow", "ai_tool"
    
    // For 'question' events
    questionLength?: number;
    conceptsAsked?: string[];
    
    // For 'explanation' events
    explanationLength?: number;
    explanationQuality?: number; // 0-100
    
    // For 'save' events
    codeLength?: number;
    filesChanged?: number;
  };
}

// Store in database for later analysis
```

### Paste Detection Algorithm

```typescript
function detectPaste(
  currentCode: string,
  previousCode: string,
  timeSinceLastChange: number
): PasteDetectionResult {
  
  // Check if new code appeared suddenly
  const linesAdded = currentCode.split('\n').length - previousCode.split('\n').length;
  const newContentRatio = (linesAdded / currentCode.split('\n').length);
  
  // If > 30% new lines appeared in < 30 seconds = likely paste
  if (newContentRatio > 0.3 && timeSinceLastChange < 30000) {
    return {
      isPaste: true,
      confidence: 0.9,
      pasteLength: linesAdded
    };
  }
  
  return {
    isPaste: false,
    confidence: 0
  };
}

// When paste detected:
// 1. Store telemetry event
// 2. Trigger reflection challenge
// 3. Ask student: "Can you explain this code?"
// 4. Score their explanation
// 5. Update understanding score (decrease if can't explain)
```

---

## SECTION 8: DEPLOYMENT & INFRASTRUCTURE

### AWS Architecture

```
┌──────────────────────────────────────────┐
│         CloudFront CDN                   │
│   (Caches static assets globally)        │
└──────────┬───────────────────────────────┘
           │
┌──────────▼───────────────────────────────┐
│      Application Load Balancer           │
│  (Routes traffic to EC2 instances)       │
└──────────┬───────────────────────────────┘
           │
┌──────────▼───────────────────────────────┐
│    Auto-Scaling EC2 Cluster              │
│  (2–10 instances, scales based on load)  │
│                                          │
│  ├─ Node.js + Express (API)              │
│  ├─ Redis client (cache)                 │
│  └─ Monitoring agent (CloudWatch)        │
└──────────┬───────────────────────────────┘
           │
     ┌─────┴─────┬──────────┬─────────┐
     │           │          │         │
┌────▼──┐   ┌───▼──┐  ┌────▼─┐  ┌───▼──┐
│  RDS  │   │Redis │  │  S3  │  │SQS   │
│ PG    │   │Cache │  │Files │  │Queue │
└───────┘   └──────┘  └──────┘  └──────┘

External:
┌───────────────────┐
│   Claude API      │
│  (Orbit Mentor)   │
└───────────────────┘
```

### Deployment Pipeline

```
1. Developer pushes to GitHub
   ↓
2. GitHub Actions triggers build
   - Run tests
   - Run linter
   - Build Docker image
   ↓
3. If tests pass: push image to ECR
   ↓
4. Deploy to staging environment
   - Run integration tests
   - Performance tests
   ↓
5. Manual approval for production
   ↓
6. Blue-green deployment
   - New instances start with new code
   - Traffic switches when healthy
   - Old instances kept as rollback
```

### Environment Variables

```
# Production (.env.production)
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/codeorbit
REDIS_URL=redis://elasticache-endpoint:6379
CLAUDE_API_KEY=sk-***
JWT_SECRET=***
NODE_ENV=production
LOG_LEVEL=info

# Staging (.env.staging)
(same structure, different endpoints)

# Development (.env.development)
(local endpoints, debug logging)
```

### Monitoring & Alerting

```
CloudWatch Metrics:
- API response time (target: < 500ms)
- Error rate (target: < 1%)
- Database query time (target: < 100ms)
- Redis hit rate (target: > 80%)
- CPU usage (alert if > 80%)
- Memory usage (alert if > 85%)

Alerts via:
- Slack #engineering-alerts
- PagerDuty for critical issues
- Email for warnings

Key Dashboards:
- System health (uptime, response time, error rate)
- Business metrics (active users, submissions, scores)
- Infrastructure (CPU, memory, database connections)
```

---

## SECTION 9: SECURITY

### Data Protection

```
- All data encrypted in transit (HTTPS)
- All sensitive data encrypted at rest (AES-256)
- Database passwords stored in AWS Secrets Manager
- API keys never logged or exposed
- PII masked in logs
```

### Authentication & Authorization

```
- JWT tokens with 1-hour expiration
- Refresh tokens with 7-day expiration
- Role-based access control (RBAC)
- Students can only access their own data
- Mentors can only access assigned cohorts
- All API requests authenticated
```

### API Security

```
- Rate limiting (100 requests/minute per user)
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- CORS enabled only for whitelisted domains
- CSRF tokens for state-changing requests
- Security headers (CSP, X-Frame-Options, etc.)
```

---

## SECTION 10: DEVELOPMENT CHECKLIST (MVP)

### Backend MVP Checklist
- [ ] User authentication (register, login, logout)
- [ ] User roles (student, mentor, founder, admin)
- [ ] Project CRUD (create, read, update, delete)
- [ ] Milestone tracking and submission
- [ ] Roadmap generation (Claude integration)
- [ ] Orbit mentor API (WebSocket and REST)
- [ ] Paste detection and telemetry
- [ ] Understanding score calculator
- [ ] Mentor dashboard endpoints
- [ ] Error handling and logging
- [ ] Database migrations
- [ ] API documentation (Swagger)
- [ ] Unit tests (70%+ coverage)
- [ ] Integration tests (happy paths)

### Frontend MVP Checklist
- [ ] Auth pages (login, register)
- [ ] Student IDE (Monaco editor + file explorer)
- [ ] Project setup page
- [ ] Roadmap view
- [ ] Milestone submission flow
- [ ] Orbit chat interface
- [ ] Mentor dashboard
- [ ] Admin panel (basic)
- [ ] Responsive design (desktop + tablet)
- [ ] Error boundary and error messages
- [ ] Loading states
- [ ] Unit tests (50%+ coverage)
- [ ] Accessibility (WCAG 2.1 AA)

### Infrastructure MVP Checklist
- [ ] AWS account set up
- [ ] RDS PostgreSQL instance
- [ ] ElastiCache Redis instance
- [ ] S3 bucket for file storage
- [ ] EC2 auto-scaling group
- [ ] Application Load Balancer
- [ ] CloudFront distribution
- [ ] GitHub Actions CI/CD
- [ ] CloudWatch monitoring
- [ ] Backup strategy (daily automated backups)
- [ ] Disaster recovery plan
- [ ] SSL certificates (auto-renewal)

---

## Summary

CodeOrbit's technical stack is built for:
- **Scalability:** Can grow from 50 students to 10,000+
- **Reliability:** 99.9% uptime target
- **Simplicity:** Minimal dependencies, easy to maintain
- **Cost-efficiency:** Scales horizontally, AWS-native

The architecture prioritizes:
1. **Understanding Score accuracy** (core metric)
2. **Orbit mentor quality** (Socratic responses)
3. **Mentor dashboard performance** (dashboards load fast)
4. **Data integrity** (telemetry is trustworthy)

All infrastructure and services are designed to be deployed and maintained by a small team (2–3 engineers) initially.