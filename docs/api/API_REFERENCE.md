# 🔌 CodeOrbit — REST API Reference (API_REFERENCE.md)

This document maps all REST API endpoints exposed by the CodeOrbit Express backend microservice (OTP Verification Server).

---

## 1. Base Configurations

- **Local Port:** `8787` (Default)
- **Protocol:** HTTP
- **Authentication Header:** All mutate requests require the `x-api-key` header to authenticate requests.
  - Header: `x-api-key: <YOUR_OTP_SERVER_API_KEY>`

---

## 2. API Endpoints

### 1. Root Status Check
Verifies if the Express OTP microservice is running.
- **URL:** `GET /`
- **Auth Required:** No
- **Headers:** None
- **Response (200 OK):**
  ```json
  {
    "ok": true,
    "service": "otp-server"
  }
  ```

---

### 2. Send OTP Email
Generates and sends a 6-digit verification code to the target email address using Resend.
- **URL:** `POST /send-otp`
- **Auth Required:** Yes (API key validation)
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: <YOUR_OTP_SERVER_API_KEY>`
- **Request Body:**
  ```json
  {
    "email": "student@college.edu",
    "otpCode": "123456",
    "purpose": "signup"
  }
  ```
  *Note:* `purpose` can be `"signup"`, `"password_reset"`, or `"email_verification"`.
- **Responses:**
  - **200 OK:**
    ```json
    {
      "success": true,
      "message": "OTP email sent successfully"
    }
    ```
  - **401 Unauthorized:**
    ```json
    {
      "error": "Unauthorized"
    }
    ```
  - **500 Internal Server Error:**
    ```json
    {
      "success": false,
      "error": "Failed to send email"
    }
    ```

---

### 3. Verify OTP Code (Mock Validation)
An optional check endpoint used during developmental routing.
- **URL:** `POST /verify-otp`
- **Auth Required:** Yes
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: <YOUR_OTP_SERVER_API_KEY>`
- **Request Body:**
  ```json
  {
    "email": "student@college.edu",
    "otpCode": "123456"
  }
  ```
- **Responses:**
  - **200 OK (Match):**
    ```json
    {
      "success": true,
      "message": "OTP code verified successfully"
    }
    ```
  - **400 Bad Request (Invalid):**
    ```json
    {
      "success": false,
      "message": "Invalid OTP code"
    }
    ```
