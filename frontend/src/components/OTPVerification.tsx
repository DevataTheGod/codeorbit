import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { OTPService } from '@/services/OTPService';
import { AlertCircle, CheckCircle2, Clock, Mail } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  onVerifySuccess: () => void;
  onBack: () => void;
  purpose?: 'signup' | 'password_reset' | 'email_verification';
  supportUrl?: string;
  autoResendAfterMs?: number;
}

/**
 * OTPVerification Component
 * Handles OTP input, verification, and resend logic
 */
export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onVerifySuccess,
  onBack,
  purpose = 'signup',
  supportUrl = 'https://discord.gg/codeorbit',
  autoResendAfterMs = 120000,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showAutoResendHint, setShowAutoResendHint] = useState(false);
  const { toast } = useToast();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendCountdown === 0 && showAutoResendHint && !success) {
      // Auto-prompt to resend after timeout
      setShowAutoResendHint(true);
    }
  }, [resendCountdown, showAutoResendHint, success]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    if (value.length > 1) return; // Only one character per input

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    setError('');
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const pastedOtp = pastedText.replace(/\D/g, '').split('').slice(0, 6);

    const newOtp = [...otp];
    pastedOtp.forEach((digit, index) => {
      newOtp[index] = digit;
    });
    setOtp(newOtp);

    // Focus last input if all digits pasted
    if (pastedOtp.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const data = await OTPService.verifyOTP(email, otpCode, purpose);
      if (!data.isValid) {
        // Map server error codes/messages to friendly UI text
        const serverError = data.error || data.message || '';
        let friendly = 'Invalid OTP. Please try again.';
        if (serverError.includes('otp_not_found') || serverError.includes('invalid')) {
          friendly = 'The code you entered is incorrect. Request a new code if needed.';
        } else if (serverError.includes('otp_expired') || serverError.includes('expired')) {
          friendly = 'This code has expired. Request a new code to continue.';
        } else if (serverError.includes('rate_limited')) {
          friendly = 'Too many requests. Please wait a minute before trying again.';
        } else if (serverError.includes('unauthorized')) {
          friendly = 'Verification not authorized. Please restart the signup flow.';
        } else if (serverError.includes('send_failed')) {
          friendly = 'There was a problem verifying your code. Try again later.';
        }

        setError(friendly);
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        // After 3 failed attempts, suggest resend
        if (newAttempts >= 3) {
          setShowAutoResendHint(true);
        }

        setOtp(['', '', '', '', '', '']);
        return;
      }

      setSuccess(true);
      toast({
        title: 'Success',
        description: 'Email verified successfully!',
      });

      // Call success callback after brief delay
      setTimeout(() => {
        onVerifySuccess();
      }, 1500);
    } catch (err) {
      setError('Verification failed. Please try again.');
      console.error('OTP verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError('');

    try {
      const data = await OTPService.resendOTP(email, purpose);
      if (!data.success) {
        const serverError = data.message || '';
        let friendly = 'Failed to resend OTP. Please try again.';
        if (serverError.includes('rate_limited')) {
          friendly = 'You are sending requests too quickly. Try again in a minute.';
        } else if (serverError.includes('unauthorized')) {
          friendly = 'Unable to resend. Please restart the signup flow.';
        } else if (serverError.includes('otp_not_found')) {
          friendly = 'No pending request found. Please start signup again.';
        }
        setError(friendly);
        return;
      }

      toast({
        title: 'OTP Sent',
        description: `New code sent to ${email}`,
      });

      setOtp(['', '', '', '', '', '']);
      setResendCountdown(60); // 60 seconds before can resend again
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
      console.error('Resend OTP error:', err);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <Mail className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Verify Your Email</h2>
        <p className="text-gray-600 mt-2">
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      {/* OTP Input Fields */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Enter Verification Code
        </label>
        <div className="flex gap-2 justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              placeholder="0"
              disabled={isVerifying || success}
              className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          ))}
        </div>
      </div>

      {/* Error Message with helpful hints */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
            {showAutoResendHint && (
              <p className="text-xs text-red-700 mt-2">
                💡 Tip: Didn't get the code? Try{' '}
                <button
                  onClick={handleResendOTP}
                  disabled={resendCountdown > 0 || isResending || success}
                  className="font-semibold underline hover:no-underline disabled:opacity-50"
                >
                  requesting a new one
                </button>
                . Still having issues?{' '}
                <a
                  href={supportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline hover:no-underline"
                >
                  Contact support
                </a>
                .
              </p>
            )}
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-800">Email verified successfully!</p>
        </div>
      )}

      {/* Expiry Info */}
      <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800">Code expires in 10 minutes</p>
      </div>

      {/* Verify Button */}
      <Button
        onClick={handleVerifyOTP}
        disabled={otp.some((d) => !d) || isVerifying || success}
        className="w-full mb-3 bg-blue-600 hover:bg-blue-700"
      >
        {isVerifying ? 'Verifying...' : success ? 'Verified!' : 'Verify Code'}
      </Button>

      {/* Resend OTP */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          Didn't receive the code?{' '}
          <button
            onClick={handleResendOTP}
            disabled={resendCountdown > 0 || isResending || success}
            className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
          </button>
        </p>
        {resendCountdown === 0 && failedAttempts > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Still no email? Check spam or{' '}
            <a href={supportUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              get help
            </a>
            .
          </p>
        )}
      </div>

      {/* Back Button */}
      <Button
        onClick={onBack}
        variant="outline"
        className="w-full"
        disabled={isVerifying || success}
      >
        Back
      </Button>

      {/* Info */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Check spam folder if you don't see the email
      </p>
    </div>
  );
};
