# Forge Learn - System Requirements & Specifications

## 1. Project Overview

Forge Learn is an educational platform that combines learning management, project-based education, and AI-powered mentorship. The system enables students to learn through hands-on projects with guidance from an AI chatbot (BODHIT) and human mentors.

### 1.1 Project Goals

- Provide an integrated development environment for learning
- Enable AI-powered project guidance without giving direct code solutions
- Track student progress through milestone-based learning
- Generate structured mentor reports for human review
- Support multiple user roles (Student, Mentor, Admin)
- Persist conversations and project state across sessions

### 1.2 Target Users

- **Students** - Individuals learning software development through projects
- **Mentors** - Educators reviewing student work and providing guidance
- **Admins** - Platform administrators managing users and content

## 2. Functional Requirements

### 2.1 Authentication & Authorization

#### 2.1.1 User Registration
- **FR-AUTH-001**: System shall support email/password registration
- **FR-AUTH-002**: System shall support Google OAuth registration
- **FR-AUTH-003**: System shall require OTP verification for new accounts
- **FR-AUTH-004**: OTP codes shall expire after 10 minutes
- **FR-AUTH-005**: OTP codes shall be 6 digits long
- **FR-AUTH-006**: System shall send OTP via email (Gmail API or SMTP)

#### 2.1.2 User Login
- **FR-AUTH-007**: System shall support email/password login
- **FR-AUTH-008**: System shall support Google OAuth login
- **FR-AUTH-009**: System shall maintain user sessions via JWT tokens
- **FR-AUTH-010**: Sessions shall persist across browser refreshes

#### 2.1.3 Role Management
- **FR-AUTH-011**: System shall assign one of three roles: student, mentor, admin
- **FR-AUTH-012**: Default role for new users shall be "student"
- **FR-AUTH-013**: Admins shall be able to change user roles
- **FR-AUTH-014**: Role changes shall take effect immediately

### 2.2 AI Chatbot (BODHIT)

#### 2.2.1 Intake Flow
- **FR-CHAT-001**: Chatbot shall collect project intake information:
  - Project idea/description
  - Technology stack
  - Skill level (beginner/intermediate/advanced)
  - Timeline/deadline
- **FR-CHAT-002**: System shall parse intake fields from natural language
- **FR-CHAT-003**: System shall echo back parsed fields for confirmation
- **FR-CHAT-004**: User must confirm intake with "yes" before proceeding
- **FR-CHAT-005**: System shall store intake data with conversation

#### 2.2.2 Guidance Behavior
- **FR-CHAT-006**: Chatbot shall refuse to provide direct code solutions
- **FR-CHAT-007**: Chatbot shall guide students through problem-solving
- **FR-CHAT-008**: Chatbot shall ask clarifying questions
- **FR-CHAT-009**: Chatbot shall provide conceptual explanations
- **FR-CHAT-010**: Chatbot shall suggest resources and documentation

#### 2.2.3 Mentor Report Generation
- **FR-CHAT-011**: System shall generate mentor reports in JSON format
- **FR-CHAT-012**: Reports shall include:
  - Milestone name
  - Student understanding level (high/medium/low)
  - Strengths (array)
  - Weak areas (array)
  - Red flags (array, can be empty)
  - Mentor recommendation
  - Feedback for student
- **FR-CHAT-013**: Reports shall be automatically saved to database
- **FR-CHAT-014**: Reports shall be linked to project submissions
- **FR-CHAT-015**: Mentors shall be able to view all reports
- **FR-CHAT-016**: Students shall only view their own reports

### 2.3 Integrated Development Environment (IDE)

#### 2.3.1 Code Editor
- **FR-IDE-001**: System shall provide Monaco-based code editor
- **FR-IDE-002**: Editor shall support syntax highlighting for common languages
- **FR-IDE-003**: Editor shall support auto-completion
- **FR-IDE-004**: Editor shall support multiple tabs
- **FR-IDE-005**: Editor shall auto-save changes

#### 2.3.2 File System
- **FR-IDE-006**: System shall provide virtual file system
- **FR-IDE-007**: Users shall be able to create files and folders
- **FR-IDE-008**: Users shall be able to rename files and folders
- **FR-IDE-009**: Users shall be able to delete files and folders
- **FR-IDE-010**: Users shall be able to upload files
- **FR-IDE-011**: Users shall be able to download files
- **FR-IDE-012**: File system state shall persist across sessions
- **FR-IDE-013**: System shall support file search

#### 2.3.3 Terminal
- **FR-IDE-014**: System shall provide terminal emulator
- **FR-IDE-015**: Terminal shall support basic commands
- **FR-IDE-016**: Terminal output shall be displayed in real-time
- **FR-IDE-017**: Terminal history shall be preserved

#### 2.3.4 AI Chat Panel
- **FR-IDE-018**: IDE shall include integrated AI chat panel
- **FR-IDE-019**: Chat panel shall provide coding assistance
- **FR-IDE-020**: Chat panel shall access current file context
- **FR-IDE-021**: Chat panel shall support code suggestions

#### 2.3.5 GitHub Integration
- **FR-IDE-022**: System shall support GitHub repository import
- **FR-IDE-023**: Users shall authenticate with GitHub
- **FR-IDE-024**: System shall fetch repository file structure
- **FR-IDE-025**: System shall import repository files to IDE

### 2.4 Project Submissions

#### 2.4.1 Submission Creation
- **FR-SUB-001**: Students shall be able to submit projects
- **FR-SUB-002**: Submissions shall include:
  - Project title
  - Description
  - GitHub repository URL
  - Technology stack
  - Status (pending/in_progress/completed)
- **FR-SUB-003**: System shall validate GitHub URLs
- **FR-SUB-004**: System shall track submission timestamps

#### 2.4.2 Submission Review
- **FR-SUB-005**: Mentors shall view all submissions
- **FR-SUB-006**: Mentors shall filter submissions by status
- **FR-SUB-007**: Mentors shall add feedback to submissions
- **FR-SUB-008**: Students shall receive notifications of feedback

### 2.5 Progress Tracking

#### 2.5.1 Milestone Management
- **FR-PROG-001**: System shall generate project milestones
- **FR-PROG-002**: Milestones shall be based on project intake
- **FR-PROG-003**: System shall track milestone completion
- **FR-PROG-004**: System shall calculate overall progress percentage

#### 2.5.2 Progress Visualization
- **FR-PROG-005**: Students shall view progress dashboard
- **FR-PROG-006**: Dashboard shall display:
  - Current milestone
  - Completion percentage
  - Time spent
  - Upcoming milestones
- **FR-PROG-007**: Progress shall update in real-time

### 2.6 Conversation Persistence

#### 2.6.1 Conversation Management
- **FR-CONV-001**: System shall save all chat conversations
- **FR-CONV-002**: Conversations shall be linked to users
- **FR-CONV-003**: Users shall view conversation history
- **FR-CONV-004**: Users shall resume previous conversations
- **FR-CONV-005**: Users shall delete conversations
- **FR-CONV-006**: System shall auto-generate conversation titles

#### 2.6.2 Message Storage
- **FR-CONV-007**: System shall store all messages with:
  - Content
  - Role (user/assistant/system)
  - Timestamp
  - Conversation ID
- **FR-CONV-008**: Messages shall be retrieved in chronological order
- **FR-CONV-009**: System shall support message pagination

### 2.7 Dashboard Features

#### 2.7.1 Student Dashboard
- **FR-DASH-001**: Students shall access personalized dashboard
- **FR-DASH-002**: Dashboard shall display:
  - Active projects
  - Progress overview
  - Recent conversations
  - Upcoming milestones
  - Mentor feedback
- **FR-DASH-003**: Students shall access IDE from dashboard
- **FR-DASH-004**: Students shall access chatbot from dashboard

#### 2.7.2 Mentor Dashboard
- **FR-DASH-005**: Mentors shall access mentor dashboard
- **FR-DASH-006**: Dashboard shall display:
  - Pending submissions
  - Student progress overview
  - Recent mentor reports
  - Students requiring attention
- **FR-DASH-007**: Mentors shall filter by student or project
- **FR-DASH-008**: Mentors shall export reports

#### 2.7.3 Admin Dashboard
- **FR-DASH-009**: Admins shall access admin dashboard
- **FR-DASH-010**: Dashboard shall display:
  - User statistics
  - System usage metrics
  - Recent activity
  - User management tools
- **FR-DASH-011**: Admins shall manage user roles
- **FR-DASH-012**: Admins shall view audit logs

## 3. Non-Functional Requirements

### 3.1 Performance

- **NFR-PERF-001**: Page load time shall be < 3 seconds
- **NFR-PERF-002**: API response time shall be < 500ms (95th percentile)
- **NFR-PERF-003**: Chatbot response time shall be < 5 seconds
- **NFR-PERF-004**: IDE shall handle files up to 10MB
- **NFR-PERF-005**: System shall support 100 concurrent users

### 3.2 Security

- **NFR-SEC-001**: All API endpoints shall require authentication
- **NFR-SEC-002**: Passwords shall be hashed using bcrypt
- **NFR-SEC-003**: JWT tokens shall expire after 24 hours
- **NFR-SEC-004**: Row Level Security (RLS) shall be enabled on all tables
- **NFR-SEC-005**: HTTPS shall be enforced in production
- **NFR-SEC-006**: API keys shall be stored in environment variables
- **NFR-SEC-007**: User input shall be sanitized to prevent XSS
- **NFR-SEC-008**: SQL injection prevention via parameterized queries

### 3.3 Reliability

- **NFR-REL-001**: System uptime shall be 99.5%
- **NFR-REL-002**: Database backups shall run daily
- **NFR-REL-003**: Failed API calls shall retry up to 3 times
- **NFR-REL-004**: Error messages shall be logged
- **NFR-REL-005**: System shall gracefully handle API failures

### 3.4 Usability

- **NFR-USE-001**: UI shall be responsive (mobile, tablet, desktop)
- **NFR-USE-002**: Interface shall follow accessibility guidelines
- **NFR-USE-003**: Error messages shall be user-friendly
- **NFR-USE-004**: Loading states shall be indicated
- **NFR-USE-005**: Forms shall validate input in real-time

### 3.5 Scalability

- **NFR-SCAL-001**: Database shall support 10,000+ users
- **NFR-SCAL-002**: System shall handle 1M+ messages
- **NFR-SCAL-003**: File storage shall scale to 100GB+
- **NFR-SCAL-004**: API shall support horizontal scaling

### 3.6 Maintainability

- **NFR-MAIN-001**: Code shall follow TypeScript best practices
- **NFR-MAIN-002**: Components shall be modular and reusable
- **NFR-MAIN-003**: API endpoints shall be documented
- **NFR-MAIN-004**: Database schema shall be version controlled
- **NFR-MAIN-005**: Environment variables shall be documented

## 4. System Architecture

### 4.1 Technology Stack

#### Frontend
- React 18 with TypeScript
- Vite (build tool)
- React Router (routing)
- TanStack Query (state management)
- shadcn/ui + Radix UI (components)
- Tailwind CSS (styling)
- Monaco Editor (code editor)

#### Backend
- Supabase (PostgreSQL database)
- Supabase Auth (authentication)
- Supabase Edge Functions (serverless)
- Express (OTP server)

#### External Services
- Lovable API (AI chat)
- Gmail API (email delivery)
- GitHub API (repository integration)

### 4.2 Database Schema

#### Tables
1. **users** - User accounts and profiles
2. **user_roles** - Role assignments
3. **project_submissions** - Student project submissions
4. **conversations** - Chat conversation metadata
5. **messages** - Individual chat messages
6. **mentor_reports** - AI-generated mentor feedback
7. **progress_entries** - Milestone progress tracking
8. **audit_log** - System activity logging

#### Key Relationships
- users → user_roles (1:many)
- users → conversations (1:many)
- conversations → messages (1:many)
- project_submissions → mentor_reports (1:many)
- users → project_submissions (1:many)
- users → progress_entries (1:many)

### 4.3 API Endpoints

#### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/send-otp` - Send OTP code
- `POST /auth/verify-otp` - Verify OTP code

#### Chat
- `POST /functions/v1/bodhit-chat` - Send message to chatbot
- `GET /api/conversations` - List user conversations
- `POST /api/conversations` - Create conversation
- `DELETE /api/conversations/:id` - Delete conversation
- `GET /api/messages/:conversationId` - Get conversation messages

#### Projects
- `POST /api/submissions` - Submit project
- `GET /api/submissions` - List submissions
- `GET /api/submissions/:id` - Get submission details
- `PUT /api/submissions/:id` - Update submission
- `DELETE /api/submissions/:id` - Delete submission

#### Progress
- `POST /functions/v1/generate-milestones` - Generate project milestones
- `GET /api/progress/:userId` - Get user progress
- `POST /api/progress` - Update progress entry

#### Mentor Reports
- `GET /api/mentor-reports` - List reports (filtered by role)
- `GET /api/mentor-reports/:submissionId` - Get reports for submission
- `POST /api/mentor-reports` - Create report (automated)

## 5. Data Models

### 5.1 User
```typescript
interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: timestamp;
  updated_at: timestamp;
}
```

### 5.2 Conversation
```typescript
interface Conversation {
  id: string;
  user_id: string;
  title: string;
  intake_data?: {
    project_idea: string;
    tech_stack: string;
    skill_level: string;
    timeline: string;
  };
  created_at: timestamp;
  updated_at: timestamp;
}
```

### 5.3 Message
```typescript
interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: timestamp;
}
```

### 5.4 Project Submission
```typescript
interface ProjectSubmission {
  id: string;
  user_id: string;
  title: string;
  description: string;
  github_url: string;
  tech_stack: string[];
  status: 'pending' | 'in_progress' | 'completed';
  submitted_at: timestamp;
  updated_at: timestamp;
}
```

### 5.5 Mentor Report
```typescript
interface MentorReport {
  id: string;
  submission_id: string;
  report: {
    milestone_name: string;
    student_understanding_level: 'high' | 'medium' | 'low';
    strengths: string[];
    weak_areas: string[];
    red_flags: string[];
    mentor_recommendation: string;
    feedback_for_student: string;
  };
  raw_text: string;
  created_at: timestamp;
  updated_at: timestamp;
}
```

### 5.6 Progress Entry
```typescript
interface ProgressEntry {
  id: string;
  user_id: string;
  submission_id?: string;
  milestone_name: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completion_percentage: number;
  notes?: string;
  created_at: timestamp;
  updated_at: timestamp;
}
```

## 6. User Workflows

### 6.1 Student Onboarding
1. User visits /auth
2. Chooses signup method (email or Google)
3. Enters credentials
4. Receives OTP via email
5. Enters OTP to verify
6. Account created with "student" role
7. Redirected to student dashboard

### 6.2 Project Submission Flow
1. Student navigates to "Submit Project"
2. Fills out project form
3. Provides GitHub repository URL
4. System validates URL
5. Submission created
6. Student redirected to dashboard
7. Mentor receives notification

### 6.3 AI Chat Interaction
1. Student opens chatbot
2. Bot requests intake information
3. Student provides project details
4. Bot confirms intake
5. Student asks questions about milestone
6. Bot provides guidance (no code)
7. Bot generates mentor report
8. Report saved to database
9. Conversation persists

### 6.4 Mentor Review Process
1. Mentor logs in
2. Views pending submissions
3. Selects submission to review
4. Views associated mentor reports
5. Reviews student progress
6. Adds feedback
7. Updates submission status
8. Student receives notification

## 7. Testing Requirements

### 7.1 Unit Testing
- Test individual components
- Test service functions
- Test utility functions
- Minimum 70% code coverage

### 7.2 Integration Testing
- Test API endpoints
- Test database operations
- Test authentication flow
- Test file system operations

### 7.3 End-to-End Testing
- Test complete user workflows
- Test cross-browser compatibility
- Test responsive design
- Test error scenarios

### 7.4 Security Testing
- Test authentication bypass attempts
- Test SQL injection prevention
- Test XSS prevention
- Test CSRF protection

## 8. Deployment Requirements

### 8.1 Environment Configuration
- Development environment
- Staging environment
- Production environment
- Environment-specific variables

### 8.2 CI/CD Pipeline
- Automated testing on commit
- Automated builds
- Automated deployments
- Rollback capability

### 8.3 Monitoring
- Error tracking (Sentry or similar)
- Performance monitoring
- User analytics
- API usage metrics

### 8.4 Backup & Recovery
- Daily database backups
- File storage backups
- Disaster recovery plan
- Data retention policy

## 9. Future Enhancements

### 9.1 Planned Features
- Video call integration for mentor sessions
- Code review tools
- Peer collaboration features
- Gamification (badges, leaderboards)
- Mobile app (React Native)
- Advanced analytics dashboard
- Integration with more Git providers (GitLab, Bitbucket)
- AI code review suggestions
- Automated testing integration

### 9.2 Scalability Improvements
- Microservices architecture
- CDN for static assets
- Database sharding
- Caching layer (Redis)
- Load balancing

## 10. Compliance & Legal

### 10.1 Data Privacy
- GDPR compliance
- User data export capability
- Right to be forgotten
- Privacy policy
- Terms of service

### 10.2 Accessibility
- WCAG 2.1 Level AA compliance
- Screen reader support
- Keyboard navigation
- Color contrast requirements

## 11. Success Metrics

### 11.1 User Engagement
- Daily active users
- Average session duration
- Conversation completion rate
- Project submission rate

### 11.2 Learning Outcomes
- Milestone completion rate
- Time to project completion
- Student satisfaction score
- Mentor feedback quality

### 11.3 System Performance
- API response times
- Error rates
- System uptime
- Page load times

---

**Document Version**: 1.0  
**Last Updated**: February 15, 2026  
**Status**: Active Development
