import express, { Request, Response } from "express";
import { Resend } from "resend";

const router = express.Router();

type OtpPurpose = "signup" | "password_reset" | "email_verification";

function getPurposeText(purpose: OtpPurpose): string {
  switch (purpose) {
    case "password_reset":
      return "reset your password";
    case "email_verification":
      return "verify your email address";
    default:
      return "sign up for your account";
  }
}

function getEmailSubject(purpose: OtpPurpose): string {
  switch (purpose) {
    case "password_reset":
      return "Reset Your Password - OTP";
    case "email_verification":
      return "Verify Your Email - OTP";
    default:
      return "Complete Your Signup - OTP";
  }
}

function getEmailHtml(otpCode: string, purpose: OtpPurpose): string {
  const purposeText = getPurposeText(purpose);

  return `
<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif; color: #222; line-height: 1.5;">
    <div style="max-width: 560px; margin: 20px auto; border: 1px solid #e6e6e6; border-radius: 10px; overflow: hidden;">
      <div style="background: #111827; color: #fff; padding: 16px 20px;">
        <h2 style="margin: 0; font-size: 18px;">CodeOrbit Verification</h2>
      </div>
      <div style="padding: 20px;">
        <p style="margin-top: 0;">Welcome to CodeOrbit! You requested to ${purposeText}.</p>
        <p>Use this one-time password:</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; background: #f3f4f6; border-radius: 8px; padding: 14px 16px; text-align: center;">
          ${otpCode}
        </div>
        <p style="margin-bottom: 0;">This code expires in 10 minutes.</p>
      </div>
    </div>
  </body>
</html>`;
}

function isAuthorized(req: Request): boolean {
  const configuredApiKey = process.env.OTP_SERVER_API_KEY;
  if (!configuredApiKey) return true;
  const providedApiKey = req.header("x-api-key");
  return providedApiKey === configuredApiKey;
}

/**
 * POST /send-otp
 * Body: { email: string, otp: string, purpose?: 'signup'|'password_reset'|'email_verification' }
 */
router.post("/send-otp", async (req: Request, res: Response) => {
  try {
    if (!isAuthorized(req)) {
      return res.status(401).json({ success: false, error: "unauthorized", message: "Invalid API key" });
    }

    const { email, otp, purpose = "signup" } = req.body as {
      email?: string;
      otp?: string;
      purpose?: OtpPurpose;
    };

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: "invalid_input",
        message: "email and otp are required",
      });
    }

    const provider = (process.env.OTP_PROVIDER || "resend").toLowerCase();

    if (provider !== "resend") {
      return res.status(400).json({
        success: false,
        error: "provider_not_supported",
        message: "Set OTP_PROVIDER=resend for this route.",
      });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.OTP_FROM_EMAIL;
    if (!resendApiKey || !fromEmail) {
      return res.status(500).json({
        success: false,
        error: "server_misconfigured",
        message: "RESEND_API_KEY and OTP_FROM_EMAIL are required on backend.",
      });
    }

    const resend = new Resend(resendApiKey);
    const subject = getEmailSubject(purpose);
    const html = getEmailHtml(otp, purpose);

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject,
      html,
    });

    if (error) {
      console.error("Resend send error:", error);
      return res.status(502).json({
        success: false,
        error: "send_failed",
        message: "Failed to send OTP email",
      });
    }

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP route error:", error);
    return res.status(500).json({
      success: false,
      error: "internal_error",
      message: "Failed to send OTP",
    });
  }
});

router.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, provider: process.env.OTP_PROVIDER || "resend" });
});

export default router;
