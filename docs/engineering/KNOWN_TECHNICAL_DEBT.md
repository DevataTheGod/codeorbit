# Known Technical Debt

Issues, limitations, and future improvements.

---

## Resolved (Day 1)

| Issue | Status | Resolution |
|-------|--------|------------|
| Duplicate `functions/` directory | ✅ Resolved | Removed, `supabase/functions/` is canonical |
| `AMIT-BODHIT` in AI prompts | ✅ Resolved | Replaced with "CodeOrbit" |
| `bodhit-chat` naming | ✅ Resolved | Renamed to `orbit-chat` |
| Legacy brand references | ✅ Resolved | Updated across codebase |
| Broken symlink | ✅ Resolved | Recreated proper directory structure |

### Resolved (Sprint — Phase B/C)

| Issue | Status | Resolution |
|-------|--------|------------|
| Settings panel non-editable | ✅ Resolved | Font size (12/14/16/18) and theme (VS Dark/Light/Solarized), persisted to localStorage |
| "Prettier" fake label | ✅ Resolved | Renamed to "Quick Format" — honest naming |
| Extensions state lost on reload | ✅ Resolved | Install state persisted to localStorage `CODEORBIT_EXTENSIONS` |
| "Commit & Sync" misleading | ✅ Resolved | Renamed to "Save Snapshot" with metadata |
| "Build stability: 98%" fake metric | ✅ Resolved | Replaced with real file count from VFS |
| Hardcoded notifications | ✅ Resolved | Dynamic from milestones, "Welcome to CodeOrbit!" fallback |
| Source Control label misleading | ✅ Resolved | Renamed to "Snapshots" |

---

## Current Debt

### Database & Types

| Issue | Impact | Priority |
|-------|--------|----------|
| Schema type mismatch | Local generated types (`types.ts`) lack columns/tables. Code relies on `as any` bypasses to compile. | Medium |
| Remaining pilot security gaps | CORS still permissive, rate limiting not implemented, prompt input still needs sanitization | High (Active Phase 3) |
| `tasks` table missing | Milestones have no child tasks in current schema | Medium |

### Frontend

| Issue | Impact | Priority |
|-------|--------|----------|
| localStorage for IDE files | No persistence of editor files across devices | Low |
| No real-time updates | Polling and fetch-on-mount instead of WebSockets/Realtime subscriptions | Medium |
| Quick Format is not real Prettier | Basic formatting only (trim whitespace, normalize indentation). No AST-based formatting, no multi-language support. | Low |

### Backend

| Issue | Impact | Priority |
|-------|--------|----------|
| Edge Function cold starts | 1-2s latency on first request | Low |
| Express single instance | Scaling limitations for local OTP server | Medium |

---

## Future Improvements & Feature Status

### Understanding Score (Core Pedagogy)

**Status**: ✅ Implemented (v1 validation phase)

**Completed**:
- `understanding_scores` table added
- Score calculation service (`UnderstandingScoreService.ts`)
- Dashboard widgets on student/mentor views

### Reflection Challenges

**Status**: ✅ Implemented (v1 validation phase)

**Completed**:
- `reflection_challenges` table added
- Challenge generator and response evaluation service (`ReflectionChallengeService.ts`)
- Paste-event triggered validation workflow

### Telemetry Engine

**Status**: ✅ Implemented

**Completed**:
- `telemetry_events` table added
- `useTelemetry` React hook tracking keystrokes and paste ratios
- Telemetry event persistence service (`TelemetryService`)

### Real-Time Updates (Low Priority)

**Status**: 🔴 Not started

**Options**:
- Supabase Realtime subscriptions
- WebSocket gateway

---

## Schema Drift Notes

### Current Schema vs fdocs

The initial fdocs mismatch has been successfully resolved:

| Table in initial fdocs | Current Status | Action |
|------------------------|----------------|--------|
| `bootcamps` | Missing | Create when scaling to multi-tenant |
| `cohorts` | Missing | Create when scaling to multi-tenant |
| `reflections` | ✅ Implemented | Created as `reflection_challenges` |
| `telemetry` | ✅ Implemented | Created as `telemetry_events` |
| `understanding_scores` | ✅ Implemented | Created as `understanding_scores` |
| `mentor_feedback` | ✅ Implemented | Created as `mentor_reports` |

---

## Priority Matrix

| Item | Impact | Effort | Priority |
|------|--------|--------|----------|
| CORS restriction and rate limiting | High | Low-Medium | P0 |
| ValidationDashboard fake-data sync isolation | High | Low | P0 |
| Local TypeScript schema sync | Medium | Low | P1 |
| Expand test coverage with E2E and production smoke tests | Medium | Medium | P1 |
| Real-time updates (Supabase Realtime) | Low | High | P2 |

---

*This document tracks technical debt. Update as issues are resolved or new ones discovered.*
