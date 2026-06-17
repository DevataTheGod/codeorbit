/**
 * Google Auth OTP Service
 * 
 * Uses Google OAuth to:
 * 1. Authenticate users (sign in with Google)
 * 2. Send OTP via Gmail API
 * 3. Verify OTP codes
 * 
 * Benefits:
 * - No need for separate email service (Gmail API)
 * - User already authenticated via Google
 * - Automatic email delivery
 * - No separate credentials needed
 * - Built-in 2FA support
 */

import { supabase } from '@/integrations/supabase/client';

interface GoogleAuthOTPResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  userEmail?: string;
  expiresAt?: Date;
}

interface VerifyOTPResponse {
  success: boolean;
  message: string;
  isValid?: boolean;
}

export class GoogleAuthOTPService {
  private static readonly OTP_LENGTH = 6;
  private static readonly OTP_EXPIRY_MINUTES = 10;

  /**
   * Initialize Google OAuth flow and get user's Google account email
   * This is the first step in Google Auth signup
   */
  static async initiateGoogleAuth(): Promise<GoogleAuthOTPResponse> {
    try {
      // Use Supabase's built-in Google OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return {
          success: false,
          message: 'Failed to initiate Google Auth: ' + error.message,
        };
      }

      return {
        success: true,
        message: 'Google Auth initiated. Redirecting to Google login...',
      };
    } catch (error) {
      console.error('Google Auth error:', error);
      return {
        success: false,
        message: 'Failed to start Google authentication',
      };
    }
  }

  /**
   * Get current user's Google email and prepare to send OTP
   * Call this after Google OAuth callback
   */
  static async getGoogleUserEmail(): Promise<GoogleAuthOTPResponse> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user?.email) {
        return {
          success: false,
          message: 'Failed to get user email from Google Auth',
        };
      }

      return {
        success: true,
        message: 'Google email retrieved',
        userEmail: user.email,
      };
    } catch (error) {
      console.error('Error getting Google user email:', error);
      return {
        success: false,
        message: 'Failed to retrieve user email',
      };
    }
  }

  /**
   * Send OTP via Google Gmail API
   * Requires Google OAuth credentials and Gmail API enabled
   */
  static async sendOTPViaGmail(
    email: string,
    purpose: 'signup' | 'password_reset' | 'email_verification' = 'signup'
  ): Promise<GoogleAuthOTPResponse> {
    try {
      // Validate email
      if (!email || !this.isValidEmail(email)) {
        return {
          success: false,
          message: 'Invalid email address',
        };
      }

      // Generate OTP
      const otpCode = this.generateOTP();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      // Store OTP in Supabase
      const { error: insertError } = await supabase
        .from('otp_codes')
        .insert({
          email,
          otp_code: otpCode,
          purpose,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) {
        console.error('Database error storing OTP:', insertError);
        return {
          success: false,
          message: 'Failed to generate OTP. Please try again.',
        };
      }

      // Call backend OTP server to send via Gmail API
      const otpServerUrl = import.meta.env.VITE_OTP_SERVER_URL || 'http://localhost:8787';
      const serverApiKey = import.meta.env.VITE_SERVER_API_KEY;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (serverApiKey) headers['x-server-key'] = serverApiKey;

      const response = await fetch(`${otpServerUrl.replace(/\/+$/, '')}/send-otp`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          to: email,
          otp: otpCode,
          purpose,
        }),
      });

      if (!response.ok) {
        let data = { message: 'Failed to send OTP email' } as any;
        try { data = await response.json(); } catch (_) {}
        return {
          success: false,
          message: data.message || data.error || 'Failed to send OTP email',
        };
      }

      // Log for development
      if (import.meta.env.DEV) {
        console.log(`[DEV] OTP for ${email}: ${otpCode}`);
      }

      return {
        success: true,
        message: `OTP sent to ${email}. It expires in ${this.OTP_EXPIRY_MINUTES} minutes.`,
        expiresAt,
      };
    } catch (error) {
      console.error('Error sending OTP via Gmail:', error);
      return {
        success: false,
        message: 'An error occurred. Please try again later.',
      };
    }
  }

  /**
   * Verify OTP code (same as regular OTP service)
   */
  static async verifyOTP(
    email: string,
    otpCode: string,
    purpose: 'signup' | 'password_reset' | 'email_verification' = 'signup'
  ): Promise<VerifyOTPResponse> {
    try {
      if (!email || !otpCode) {
        return {
          success: false,
          message: 'Email and OTP code are required',
          isValid: false,
        };
      }

      // Find matching OTP in database
      const { data, error } = await supabase
        .from('otp_codes')
        .select('id, otp_code, is_used, expires_at')
        .eq('email', email)
        .eq('otp_code', otpCode)
        .eq('purpose', purpose)
        .eq('is_used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return {
          success: false,
          message: 'Invalid or expired OTP',
          isValid: false,
        };
      }

      // Check if OTP has expired
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        return {
          success: false,
          message: 'OTP has expired',
          isValid: false,
        };
      }

      // Mark OTP as used
      const { error: updateError } = await supabase
        .from('otp_codes')
        .update({ is_used: true })
        .eq('id', data.id);

      if (updateError) {
        console.error('Error marking OTP as used:', updateError);
        return {
          success: false,
          message: 'Verification failed. Please try again.',
          isValid: false,
        };
      }

      return {
        success: true,
        message: 'OTP verified successfully',
        isValid: true,
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'An error occurred during verification',
        isValid: false,
      };
    }
  }

  /**
   * Resend OTP via Gmail
   */
  static async resendOTPViaGmail(
    email: string,
    purpose: 'signup' | 'password_reset' | 'email_verification' = 'signup'
  ): Promise<GoogleAuthOTPResponse> {
    try {
      // Mark all previous unused OTPs as expired
      await supabase
        .from('otp_codes')
        .update({ expires_at: new Date().toISOString() })
        .eq('email', email)
        .eq('purpose', purpose)
        .eq('is_used', false);

      // Send new OTP
      return await this.sendOTPViaGmail(email, purpose);
    } catch (error) {
      console.error('Error resending OTP:', error);
      return {
        success: false,
        message: 'Failed to resend OTP',
      };
    }
  }

  /**
   * Generate a random OTP code
   */
  static generateOTP(): string {
    const length = this.OTP_LENGTH;
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Create Gmail API message (for backend use)
   * This is a helper for the backend to format Gmail API requests
   */
  static createGmailMessage(
    toEmail: string,
    otpCode: string,
    purpose: string
  ): string {
    const subject = this.getEmailSubject(purpose);
    const htmlContent = this.getEmailTemplate(otpCode, purpose);

    const email = `From: me@example.com\r\nTo: ${toEmail}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset="UTF-8"\r\n\r\n${htmlContent}`;
    return Buffer.from(email).toString('base64');
  }

  /**
   * Get email subject based on purpose
   */
  private static getEmailSubject(purpose: string): string {
    switch (purpose) {
      case 'password_reset':
        return 'Password Reset - Verification Code';
      case 'email_verification':
        return 'Email Verification - Verification Code';
      default:
        return 'Sign Up - Verification Code';
    }
  }

  /**
   * Get email HTML template
   */
  private static getEmailTemplate(otpCode: string, purpose: string): string {
    const purposeText = {
      signup: 'sign up for your account',
      password_reset: 'reset your password',
      email_verification: 'verify your email address',
    }[purpose] || 'verify your identity';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .otp-box { background: white; border: 2px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: center; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; color: #856404; padding: 10px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CodeOrbit Verification Code</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You requested to ${purposeText}. Use the verification code below:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otpCode}</div>
            </div>
            
            <p><strong>This code expires in 10 minutes.</strong></p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> Never share this code with anyone. Our team will never ask for this code.
            </div>
            
            <p>If you didn't request this code, please ignore this email.</p>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; 2025 CodeOrbit. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
