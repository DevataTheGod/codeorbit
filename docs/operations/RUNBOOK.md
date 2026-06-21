# Runbook

This document provides step-by-step procedures for common operational scenarios.

---

## Supabase Down

### Symptoms

- Frontend shows "Failed to load" errors
- API requests timeout
- Authentication fails

### Diagnosis

1. Check Supabase status page: status.supabase.com
2. Verify `.env` has correct credentials
3. Test connection: `curl $SUPABASE_URL/rest/v1/`

### Resolution

1. If Supabase is down: Wait for restoration
2. If credentials are wrong: Update `.env`
3. If connection is blocked: Check firewall/proxy

---

## Edge Function Failure

### Symptoms

- Orbit chat returns errors
- Milestone generation fails
- 500 errors in browser console

### Diagnosis

1. Check Supabase Edge Function logs
2. Verify JWT is valid
3. Check function configuration

### Resolution

1. Redeploy function: `supabase functions deploy orbit-chat`
2. Check environment variables in Supabase dashboard
3. Verify API keys are correct

---

## Migration Rollback

### Symptoms

- Database errors after migration
- Missing columns/tables
- RLS policy violations

### Diagnosis

1. Check migration files in `database/migrations/`
2. Verify migration was applied
3. Check Supabase database logs

### Resolution

1. Create rollback migration
2. Apply rollback: `supabase db push`
3. Verify data integrity

### Rollback Template

```sql
-- Rollback: [description]
DROP TABLE IF EXISTS table_name;
DROP POLICY IF EXISTS policy_name ON table_name;
```

---

## User Access Issues

### Symptoms

- User can't log in
- User sees "Access Denied"
- User can't access certain pages

### Diagnosis

1. Check user role in `user_roles` table
2. Verify RLS policies allow access
3. Check JWT is valid

### Resolution

1. Verify user exists in `auth.users`
2. Check role assignment in `user_roles`
3. Verify RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'table_name';
   ```

---

## Build Failures

### Symptoms

- `npm run build` fails
- TypeScript errors
- Missing imports

### Diagnosis

1. Run `npx tsc --noEmit` to see errors
2. Check for missing dependencies
3. Verify import paths

### Resolution

1. Install missing packages: `npm install`
2. Fix TypeScript errors
3. Verify import paths are correct

---

## Test Failures

### Symptoms

- `npm test` fails
- Specific test cases failing
- Mock issues

### Diagnosis

1. Run specific test: `npx vitest run tests/specific-test/`
2. Check test output for details
3. Verify mock setup

### Resolution

1. Fix the failing test
2. Update mocks if needed
3. Verify test isolation

---

## Performance Issues

### Symptoms

- Slow page loads
- High memory usage
- Slow API responses

### Diagnosis

1. Check browser dev tools
2. Monitor Supabase metrics
3. Review query performance

### Resolution

1. Optimize database queries
2. Add indexes
3. Implement caching
4. Optimize bundle size

---

## Security Incidents

### Symptoms

- Unauthorized access detected
- Data breach suspected
- Vulnerability reported

### Response

1. **Immediate**: Rotate all API keys
2. **Investigate**: Check access logs
3. **Contain**: Revoke compromised credentials
4. **Notify**: Inform affected users
5. **Remediate**: Fix vulnerability
6. **Document**: Create incident report

### Contact

- Security email: security@codeorbit.app
- Response time: 24 hours

---

## Monitoring Checklist

### Daily

- [ ] Check Supabase status
- [ ] Review error logs
- [ ] Monitor API usage

### Weekly

- [ ] Review user growth
- [ ] Check score distribution
- [ ] Monitor edge function performance

### Monthly

- [ ] Review security logs
- [ ] Audit user roles
- [ ] Update dependencies

---

## Emergency Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| Technical Lead | anurag@codeorbit.app | Business hours |
| Security | security@codeorbit.app | 24/7 |
| Support | support@codeorbit.app | Business hours |
