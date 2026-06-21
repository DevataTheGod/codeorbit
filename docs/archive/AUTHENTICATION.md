# 🔐 CodeOrbit — Authentication Flow (Archived)

CodeOrbit uses a hybrid authentication architecture combining Supabase Auth services (JSON Web Tokens and Row-Level Security) with a dedicated Express verification microservice for secure One-Time Password (OTP) deliveries.

---

## 1. Authentication Options

1. **Email & Password Login:**
   - Standard username/password fields validated via Supabase Auth client.
   - Successful validations prompt a 6-digit OTP challenge screen.

2. **Google OAuth Login:**
   - Triggers Google Sign-In popups/redirects.
   - Success redirects to `/auth/callback` which handles session synchronization and navigates to the role-based routing dashboard.

---

## 2. OTP Verification Flow

```
[Student] -> Inputs Email/Password -> [Supabase Auth Client]
                                            │
                                      Creates Session
                                            │
                                  Generate OTP (6-Digit)
                                            │
                                      Sends POST to
                              Express OTP Server (/send-otp)
                                            │
                                    Triggers Resend
                                            │
                                      Sends Email
                                            │
[Student] <- Receives Verification Pin ────┘
```

1. **OTP Request Trigger:**
   Upon login validation, the client requests a secure OTP token generation.
2. **OTP Microservice Routing:**
   The client makes an authenticated REST call (`POST /send-otp`) to the local Express OTP server, delivering the email, purpose (`signup` | `password_reset`), and 6-digit code.
3. **Resend Delivery:**
   The Express server formats a premium HTML email template containing the OTP code and uses the Resend API SDK to deliver it to the user.
4. **Validation:**
   The user enters the OTP pin. The client validates it against the active session token to finalize authentication.
