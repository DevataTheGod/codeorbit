# Security Audit

**Last synced**: 2026-06-21

This report now separates resolved Phase 2 findings from the remaining pilot-readiness hardening items.

## Resolved Phase 2 Findings

### 1. JWT Verification Disabled
**Location**: `supabase/config.toml`
**Status**: ✅ Resolved
**Resolution**: `verify_jwt = true` is configured for `orbit-chat` and `generate-milestones`.

### 2. RLS Bypass on Understanding Scores
**Location**: `20260620000001_add_understanding_score_tables_fixed.sql`
**Status**: ✅ Resolved for the active setup
**Resolution**: The active RLS hardening work gates score writes by authenticated ownership and staff access instead of open writes.

### 3. Role Escalation via Client
**Location**: signup trigger
**Status**: ✅ Resolved
**Resolution**: `20260621150000_secure_role_trigger.sql` forces every new signup to `student`, ignoring client-supplied role metadata.

### 4. Route-Level Access Control
**Location**: `frontend/src/App.tsx`, `frontend/src/components/auth/*`
**Status**: ✅ Resolved
**Resolution**: Authenticated routes are wrapped with `ProtectedRoute`; mentor/admin/validation routes use `RoleProtectedRoute`.

### 5. Edge Function User Validation
**Location**: `supabase/functions/orbit-chat/index.ts`, `supabase/functions/generate-milestones/index.ts`
**Status**: ✅ Improved
**Resolution**: Functions validate `Authorization` headers with `auth.getUser()` before processing requests.

---

## Remaining Pilot-Readiness Findings

### 1. Overly Permissive CORS
**Location**: Edge functions
**Issue**: `"Access-Control-Allow-Origin": "*"`
**Impact**: Any website can call Orbit AI
**Risk**: High
**Fix**: Restrict to deployed frontend domain

### 2. OTP Server Auth Bypass
**Location**: `backend/routes/googleAuthOTP.ts`
**Issue**: `if (!configuredApiKey) return true;`
**Impact**: No auth if env var not set
**Risk**: High
**Fix**: Require API key, fail closed

### 3. Prompt Injection Risk
**Location**: `supabase/functions/orbit-chat/index.ts`
**Issue**: `projectFilesContent` injected without sanitization
**Impact**: Student could extract system prompt
**Risk**: Medium
**Fix**: Sanitize inputs, limit context size

### 4. No Rate Limiting
**Location**: Edge functions
**Issue**: No rate limiting on AI endpoints
**Impact**: API credit exhaustion
**Risk**: Medium
**Fix**: Add rate limiting per user

### 5. localStorage Data Exposure
**Location**: UnderstandingScoreService, useTelemetry
**Issue**: Sensitive data in localStorage
**Impact**: Accessible via browser dev tools
**Risk**: Medium
**Fix**: Use Supabase as primary, minimize localStorage

### 6. Missing/Incomplete RLS Policies
**Tables affected**: mentor_reports, progress_entries
**Issue**: No DELETE policies, loose INSERT
**Risk**: Medium
**Fix**: Add proper RLS policies

### 7. Schema File Divergence
**Issue**: COMPLETE_DATABASE_SCHEMA.sql vs UNIFIED_DATABASE_SETUP.sql
**Impact**: Confusion about actual schema
**Risk**: Low
**Fix**: Remove or archive COMPLETE_DATABASE_SCHEMA.sql

### 8. Exposed Environment Variables
**Location**: `.env.example`, `.env`
**Issue**: Keys visible in repo
**Risk**: Low (these are public keys)
**Fix**: Ensure no production secrets in repo

### 9. No CSP Headers
**Issue**: No Content-Security-Policy
**Risk**: Low
**Fix**: Add CSP headers to frontend hosting

---

## Recommendations

### Immediate (Phase 3)
1. Restrict CORS to deployed frontend domain
2. Remove or isolate fake validation-data DB mutation path from `ValidationDashboard.tsx`
3. Add rate limiting strategy for AI endpoints
4. Run production smoke tests for auth/role routes

### Next 30 Days
5. Sanitize prompt inputs
6. Add proper RLS review to all tables
7. Remove dead schema files
8. Add E2E security checks

### Next 60 Days
9. Implement audit logging
10. Add CSP headers
11. Regular security audits
12. Penetration testing

---

## Security Score: 80/100

The critical Phase 2 access-control issues are resolved. Remaining work is pilot hardening: CORS, rate limiting, prompt-input handling, and operational smoke tests.
