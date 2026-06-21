# Frontend Architecture

React 18 + TypeScript + Vite + Tailwind + Monaco.

---

## Overview

```
frontend/
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Router + providers
│   ├── index.css             # Global styles
│   ├── pages/                # 11 route-level pages
│   ├── components/           # UI components
│   │   ├── ide/              # 13 IDE components
│   │   ├── ui/               # shadcn/ui components
│   │   └── *.tsx             # Shared components
│   ├── hooks/                # 7 custom hooks
│   ├── services/             # 6 service modules
│   ├── integrations/         # Supabase client
│   └── lib/                  # Utilities
├── index.html                # HTML entry
└── public/                   # Static assets
```

---

## Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Index | Landing page |
| `/auth` | Auth | Login/signup |
| `/auth/callback` | AuthCallback | OAuth callback |
| `/dashboard` | Dashboard | Generic dashboard |
| `/student` | StudentDashboard | Student view |
| `/mentor` | MentorDashboard | Mentor view |
| `/admin` | AdminDashboard | Admin view |
| `/ide` | IDE | Browser IDE |
| `/submit-project` | SubmitProject | Project intake |
| `/progress` | Progress | Progress tracking |
| `*` | NotFound | 404 page |

---

## IDE Components

| Component | Purpose |
|-----------|---------|
| IDEWorkspace | Main IDE layout container |
| CodeEditor | Monaco editor wrapper |
| FileExplorer | File tree sidebar |
| FileTabs | Open file tabs |
| Terminal | Integrated terminal |
| ActivityBar | Vertical nav bar (VS Code style) |
| StatusBar | Bottom status bar |
| Breadcrumbs | Path breadcrumbs |
| AIChatPanel | Orbit AI Socratic chat panel |
| CodeExplanationModal | Code explanation display |
| ContextualLearning | Context-aware learning hints |
| ExtensionsPanel | Extensions management |
| FileOperationsPanel | Local file upload |

---

## Shared Components

| Component | Purpose |
|-----------|---------|
| Header | Site header/nav |
| HeroSection | Landing hero |
| HowItWorksSection | Product explanation |
| PricingSection | Pricing display |
| CaseStudySection | Case studies |
| ContactSection | Contact form |
| FooterSection | Site footer |
| FloatingAIChat | Floating chat widget |
| OTPVerification | OTP verification modal |
| ConversationHistory | Chat history |
| EnforcementSection | Compliance display |
| TaskCard | Task display |
| SectionSwapper | Section switching |
| NavLink | Navigation links |

---

## Hooks

| Hook | Purpose |
|------|---------|
| useAuth | Auth state management (AuthProvider) |
| useConversationHistory | Chat history management |
| useProjectFiles | File system operations |
| useProgress | Progress tracking |
| useTelemetry | Cheat detection / keystroke tracking |
| use-toast | Toast notifications |
| use-mobile | Mobile detection |

---

## Services

| Service | Purpose |
|---------|---------|
| ConversationService | Chat persistence (Supabase) |
| GitHubService | GitHub integration (@octokit/rest) |
| GoogleAuthOTPService | Google Auth + OTP |
| IDEFileSystem | Virtual file system for IDE |
| OTPService | OTP email delivery |
| ProgressService | Progress/milestone tracking |

---

## State Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    React Query (Server State)                │
│         Conversations, Milestones, Progress, Auth           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Context (Client State)              │
│         Auth, Toast, Mobile, Theme                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    localStorage (Persistent State)           │
│         IDE Files (CODEORBIT_IDE_FILES)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## IDE Subsystem

### Virtual File System

**Storage**: localStorage with key `CODEORBIT_IDE_FILES`

**Structure**:
```json
{
  "/src/components/Auth.tsx": {
    "id": "auth-component",
    "path": "/src/components/Auth.tsx",
    "name": "Auth.tsx",
    "content": "// code here",
    "language": "typescript",
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  }
}
```

**Operations**:
- Create files/folders
- Read file content
- Update file content
- Delete files/folders
- Export project as JSON
- Import project from JSON

### Monaco Editor Integration

- Language support: TypeScript, JavaScript, JSON, CSS, HTML
- Syntax highlighting
- IntelliSense
- Error diagnostics
- Mini-map
- Multiple cursors

### AI Chat Panel

**Endpoint**: `/functions/v1/orbit-chat`

**Features**:
- Streaming responses
- Code highlighting
- Conversation history
- Context-aware (project files, current task)

---

## Styling

**Framework**: Tailwind CSS

**Component Library**: shadcn/ui (Radix UI primitives)

**Theme**: CSS variables for dark/light mode

**Fonts**:
- Inter (body)
- Space Grotesk (headings)
- JetBrains Mono (code)

---

## Build

**Bundler**: Vite 5

**Root**: `frontend/`

**Output**: `dist/`

**Aliases**: `@/` → `frontend/src/`

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |

---

*This is the source of truth for CodeOrbit's frontend implementation.*
