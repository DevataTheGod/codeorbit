/**
 * Backend OTP API Endpoints
 * 
 * Expected API Structure:
 * - POST /api/auth/send-otp - Send OTP to email
 * - POST /api/auth/verify-otp - Verify OTP code
 * - POST /api/auth/resend-otp - Resend OTP
 * 
 * These endpoints should be implemented in your backend (Node.js/Express, Python/FastAPI, etc.)
 * or in Supabase Edge Functions.
 * 
 * Below is the implementation for Supabase Edge Functions.
 */

// ============================================================================
// FILE: supabase/functions/send-otp/index.ts
// ============================================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, purpose } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: "Email is required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Generate OTP
    const generateOTP = () => {
      const length = 6;
      const min = Math.pow(10, length - 1);
      const max = Math.pow(10, length) - 1;
      return Math.floor(Math.random() * (max - min + 1) + min).toString();
    };

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    const { error: insertError } = await supabase
      .from("otp_codes")
      .insert({
        email,
        otp_code: otpCode,
        purpose: purpose || "signup",
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      throw insertError;
    }

    // Send email (using your email service)
    // For now, just log it (in production, use Gmail or SendGrid)
    console.log(`OTP for ${email}: ${otpCode}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `OTP sent to ${email}`,
        expiresAt,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

// ============================================================================
// FILE: supabase/functions/verify-otp/index.ts
// ============================================================================
// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
//   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
// };

// serve(async (req) => {
//   if (req.method === "OPTIONS") {
//     return new Response("ok", { headers: corsHeaders });
//   }

//   try {
//     const { email, otpCode, purpose } = await req.json();

//     if (!email || !otpCode) {
//       return new Response(
//         JSON.stringify({ success: false, message: "Email and OTP code are required" }),
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const supabase = createClient(
//       Deno.env.get("SUPABASE_URL") || "",
//       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
//     );

//     // Find OTP
//     const { data, error } = await supabase
//       .from("otp_codes")
//       .select("id, expires_at, is_used")
//       .eq("email", email)
//       .eq("otp_code", otpCode)
//       .eq("purpose", purpose || "signup")
//       .eq("is_used", false)
//       .order("created_at", { ascending: false })
//       .limit(1)
//       .single();

//     if (error || !data) {
//       return new Response(
//         JSON.stringify({ success: false, isValid: false, message: "Invalid OTP" }),
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // Check expiry
//     if (new Date(data.expires_at) < new Date()) {
//       return new Response(
//         JSON.stringify({ success: false, isValid: false, message: "OTP expired" }),
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // Mark as used
//     const { error: updateError } = await supabase
//       .from("otp_codes")
//       .update({ is_used: true })
//       .eq("id", data.id);

//     if (updateError) {
//       throw updateError;
//     }

//     return new Response(
//       JSON.stringify({ success: true, isValid: true, message: "OTP verified" }),
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error) {
//     console.error(error);
//     return new Response(
//       JSON.stringify({ success: false, message: error.message }),
//       { status: 500, headers: corsHeaders }
//     );
//   }
// });

// ============================================================================
// FILE: supabase/functions/resend-otp/index.ts
// ============================================================================
// Similar to send-otp, but invalidates previous OTP codes first

// ============================================================================
// ALTERNATIVE: Express.js Backend Implementation
// ============================================================================

// If you're using Express.js/Node.js instead of Supabase Edge Functions:

/*
import express from 'express';
import { OTPService } from '../services/OTPService';

const router = express.Router();

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email, purpose } = req.body;
    const result = await OTPService.sendOTP(email, purpose || 'signup');
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otpCode, purpose } = req.body;
    const result = await OTPService.verifyOTP(email, otpCode, purpose || 'signup');
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, purpose } = req.body;
    const result = await OTPService.resendOTP(email, purpose || 'signup');
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
*/
