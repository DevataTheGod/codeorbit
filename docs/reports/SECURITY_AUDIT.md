# Security Audit

## Critical Findings

### 1. JWT Verification Disabled
**Location**: `supabase/config.toml`
**Issue**: `verify_jwt = false` for both edge functions
**Impact**: Any unauthenticated user can invoke AI functions
**Risk**: Critical
**Fix**: Set `verify_jwt = true` for both functions

### 2. RLS Bypass on Understanding Scores
**Location**: `20260620000001_add_understanding_score_tables_fixed.sql`
**Issue**:
```sql
CREATE POLICY "System can insert scores" ON public.understanding_scores
  FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update scores" ON public.understanding_scores
  FOR UPDATE USING (true);
```
**Impact**: Any authenticated user can modify any user's scores
**Risk**: Critical
**Fix**:
```sql
CREATE POLICY "System can insert scores" ON public.understanding_scores
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "System can update scores" ON public.understanding_scores
  FOR UPDATE USING (user_id = auth.uid());
```

### 3. Role Escalation via Client
**Location**: `frontend/src/hooks/useAuth.tsx`
**Issue**: `signUp()` accepts `role` parameter from client
**Impact**: User can register as admin
**Risk**: Critical
**Fix**: Remove role from client-side signup, assign role server-side only

### 4. Overly Permissive CORS
**Location**: Edge functions
**Issue**: `"Access-Control-Allow-Origin": "*"`
**Impact**: Any website can call Orbit AI
**Risk**: High
**Fix**: Restrict to deployed frontend domain

---

## High Severity

### 5. OTP Server Auth Bypass
**Location**: `backend/routes/googleAuthOTP.ts`
**Issue**: `if (!configuredApiKey) return true;`
**Impact**: No auth if env var not set
**Risk**: High
**Fix**: Require API key, fail closed

### 6. Prompt Injection Risk
**Location**: `supabase/functions/orbit-chat/index.ts`
**Issue**: `projectFilesContent` injected without sanitization
**Impact**: Student could extract system prompt
**Risk**: Medium
**Fix**: Sanitize inputs, limit context size

### 7. No Rate Limiting
**Location**: Edge functions
**Issue**: No rate limiting on AI endpoints
**Impact**: API credit exhaustion
**Risk**: Medium
**Fix**: Add rate limiting per user

---

## Medium Severity

### 8. localStorage Data Exposure
**Location**: UnderstandingScoreService, useTelemetry
**Issue**: Sensitive data in localStorage
**Impact**: Accessible via browser dev tools
**Risk**: Medium
**Fix**: Use Supabase as primary, minimize localStorage

### 9. Missing RLS Policies
**Tables affected**: mentor_reports, progress_entries
**Issue**: No DELETE policies, loose INSERT
**Risk**: Medium
**Fix**: Add proper RLS policies

### 10. Schema File Divergence
**Issue**: COMPLETE_DATABASE_SCHEMA.sql vs UNIFIED_DATABASE_SETUP.sql
**Impact**: Confusion about actual schema
**Risk**: Low
**Fix**: Remove or archive COMPLETE_DATABASE_SCHEMA.sql

---

## Low Severity

### 11. Exposed Environment Variables
**Location**: `.env.example`, `.env`
**Issue**: Keys visible in repo
**Risk**: Low (these are public keys)
**Fix**: Ensure no production secrets in repo

### 12. No CSP Headers
**Issue**: No Content-Security-Policy
**Risk**: Low
**Fix**: Add CSP headers to frontend hosting

---

## Recommendations

### Immediate (This Week)
1. Enable JWT verification on edge functions
2. Fix RLS policies on understanding_scores
3. Remove role from client-side signup
4. Restrict CORS to frontend domain

### Next 30 Days
5. Add rate limiting to edge functions
6. Sanitize prompt inputs
7. Add proper RLS to all tables
8. Remove dead schema files

### Next 60 Days
9. Implement audit logging
10. Add CSP headers
11. Regular security audits
12. Penetration testing

---

## Security Score: 45/100

**Critical issues must be fixed before any pilot deployment.**
