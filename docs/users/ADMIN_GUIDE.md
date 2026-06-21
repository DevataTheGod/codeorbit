# Admin Guide

Welcome to the CodeOrbit Admin Portal. This guide covers user management, role assignments, and system administration.

---

## Getting Started

### 1. Access Requirements

- You must have an **Admin** role
- Admin role is assigned by another admin or during initial setup

### 2. Accessing the Dashboard

1. Sign in at [codeorbit.app](https://codeorbit.app)
2. You'll be redirected to the **Admin Dashboard**

---

## User Management

### Viewing Users

The Admin Dashboard shows all users with:

- Name and email
- Current role (Student, Mentor, Admin)
- Account creation date

### Searching and Filtering

- **Search** — Filter by name or email
- **Role Filter** — View users by role

### Changing Roles

1. Click the **Edit** button next to a user
2. Select the new role from the dropdown:
   - **Student** — Default for new signups
   - **Mentor** — Can review students and submit assessments
   - **Admin** — Full system access
3. Click **Save**

### Role Permissions

| Role | Access |
|------|--------|
| Student | Student Dashboard, IDE, Project Submission |
| Mentor | Mentor Dashboard, Validation Dashboard, Student Review |
| Admin | All dashboards, User Management, System Settings |

---

## Mentor Approval Flow

### How It Works

1. Student signs up → Assigned **Student** role
2. Admin promotes student to **Mentor** role
3. Mentor can now access Mentor Dashboard and Validation Dashboard

### Best Practices

- Only promote users you trust
- Verify the user's identity before granting mentor access
- Monitor mentor activity for the first few weeks

---

## System Monitoring

### Key Metrics to Watch

| Metric | Where to Find | Why It Matters |
|--------|---------------|----------------|
| Total Users | Admin Dashboard | Growth tracking |
| Active Mentors | Admin Dashboard | Mentorship capacity |
| Student Scores | Validation Dashboard | Learning outcomes |
| Help Requests | Mentor Dashboard | Student needs |

### Security Monitoring

- Review role changes periodically
- Check for unusual login patterns
- Monitor edge function usage

---

## Validation Management

### Running a Validation Study

1. Ensure students have completed projects
2. Assign mentors to review students
3. Have mentors submit rankings in Mentor Dashboard
4. View correlation results in Validation Dashboard
5. Export reports for analysis

### Interpreting Results

| Correlation | Action |
|-------------|--------|
| 80%+ | Algorithm is working well |
| 60-79% | Needs tuning, review edge cases |
| <60% | Significant algorithm issues |

---

## Troubleshooting

### User Can't Access Dashboard

1. Check their role in User Management
2. Verify they're assigned the correct role
3. Ask them to sign out and sign back in

### Mentor Can't See Students

1. Verify the student has enabled mentor access
2. Check that the mentor's role is correct
3. Refresh the page

### Score Not Updating

1. Check if the student has recent activity
2. Verify Supabase connection
3. Check edge function logs

---

## FAQ

### How do I create a new admin?

Only existing admins can promote users to admin. Go to User Management, find the user, and change their role to Admin.

### Can I delete users?

Currently, user deletion must be done through Supabase dashboard. Contact the development team for assistance.

### How do I reset a user's password?

Users can reset their password through the forgot password flow on the login page.

### What if a mentor is inactive?

You can demote them back to student role through User Management.
