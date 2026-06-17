import { supabase } from '@/integrations/supabase/client';

interface OTPResponse {
  success: boolean;
  message: string;
  expiresAt?: Date;
  code?: string;
  error?: string;
}

interface VerifyOTPResponse {
  success: boolean;
  message: string;
  isValid?: boolean;
  code?: string;
  error?: string;
}

/**
 * OTPService: Handles OTP generation, storage, and verification
 * 
 * NOTE: Email sending requires backend implementation.
 * This service handles:
 * - OTP generation and storage in Supabase
 * - OTP verification logic
 * - Cleanup of expired codes
 * 
 * For actual email sending, you must:
 * 1. Create a backend API endpoint (/api/auth/send-otp) that calls this service
 * 2. Use Gmail/Nodemailer or SendGrid to send emails
 * 3. The frontend will call your API endpoint instead of this service directly
 */
export class OTPService {
  private static readonly OTP_LENGTH = 6;
  private static readonly OTP_EXPIRY_MINUTES = 10;

  private static getOtpEndpoints() {
    const base = (import.meta.env.VITE_OTP_SERVER_URL || '').replace(/\/+$/, '');
    return {
      send: import.meta.env.VITE_OTP_SEND_API_URL || (base ? `${base}/send-otp` : ''),
    };
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
   * Send OTP to email (frontend calls backend endpoint)
   * Backend endpoint should use this method + email service
   */
  static async sendOTP(
    email: string,
    purpose: 'signup' | 'password_reset' | 'email_verification' = 'signup'
  ): Promise<OTPResponse> {
    try {
      // Validate email
      if (!email || !this.isValidEmail(email)) {
        return {
          success: false,
          message: 'Invalid email address',
        };
      }

      const { data: rpcData, error: rpcError } = await supabase.rpc('create_or_resend_otp', {
        p_email: email,
        p_purpose: purpose,
        p_ttl_minutes: this.OTP_EXPIRY_MINUTES,
      });

      if (rpcError || !rpcData?.success) {
        console.error('Database error creating OTP:', rpcError || rpcData);
        return {
          success: false,
          message: 'Failed to generate OTP. Please try again.',
        };
      }

      const otpCode = rpcData.otp_code as string;
      const expiresAt = new Date(rpcData.expires_at as string);
      const { send: sendEndpoint } = this.getOtpEndpoints();

      if (sendEndpoint) {
        const response = await fetch(sendEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(import.meta.env.VITE_OTP_SERVER_API_KEY
              ? { 'x-api-key': import.meta.env.VITE_OTP_SERVER_API_KEY }
              : {}),
          },
          body: JSON.stringify({ email, otp: otpCode, purpose }),
        });

        if (!response.ok) {
          const errPayload = await response.json().catch(() => ({} as any));
          console.error('OTP email API failed:', errPayload);
          return {
            success: false,
            message: errPayload?.message || errPayload?.error || 'Failed to send OTP email.',
          };
        }
      } else if (import.meta.env.DEV) {
        // Development-only fallback without email API
        console.log(`[DEV] OTP for ${email}: ${otpCode}`);
      } else {
        return {
          success: false,
          message: 'OTP email service is not configured. Set VITE_OTP_SERVER_URL or VITE_OTP_SEND_API_URL.',
        };
      }

      return {
        success: true,
        message: `OTP sent to ${email}. It expires in ${this.OTP_EXPIRY_MINUTES} minutes.`,
        expiresAt,
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'An error occurred. Please try again later.',
      };
    }
  }

  /**
   * Verify OTP code
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

      const { data, error } = await supabase.rpc('verify_otp_code', {
        p_email: email,
        p_otp_code: otpCode,
        p_purpose: purpose,
      });

      if (error || !data?.isValid) {
        return {
          success: false,
          message: data?.message || 'Invalid or expired OTP',
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
   * Resend OTP (mark previous as unused and generate new)
   */
  static async resendOTP(
    email: string,
    purpose: 'signup' | 'password_reset' | 'email_verification' = 'signup'
  ): Promise<OTPResponse> {
    try {
      // RPC will expire previous unused OTPs and create a new one.
      return await this.sendOTP(email, purpose);
    } catch (error) {
      console.error('Error resending OTP:', error);
      return {
        success: false,
        message: 'Failed to resend OTP',
      };
    }
  }

  /**
   * Cleanup expired OTP codes
   * Run this periodically (e.g., via cron job)
   */
  static async cleanupExpiredOTPs(): Promise<void> {
    try {
      const { error } = await supabase.rpc('cleanup_expired_otps');
      if (error) {
        console.error('Error cleaning up expired OTPs:', error);
      } else {
        console.log('Expired OTPs cleaned up successfully');
      }
    } catch (error) {
      console.error('Error in cleanup:', error);
    }
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
