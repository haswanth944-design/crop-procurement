import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { OTPVerification } from '../types';

// In-memory cache for fast local access
const otpCache = new Map<string, { otp: string; expiresAt: number; purpose: string }>();

// Sanitize email for firestore document id
function sanitizeEmailKey(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
}

/**
 * Requests an OTP from the backend (/api/send-otp).
 * The server generates a 6-digit code, stores it with 10 minutes expiration,
 * and emails it via Gmail SMTP to the requested address.
 */
export type OtpPurpose = 'user_signup' | 'staff_login' | 'user_login' | 'staff_signup' | 'admin_login' | string;

export async function sendEmailOtp(
  email: string,
  purpose: OtpPurpose
): Promise<{ success: boolean; error?: string; emailDelivered?: boolean; notice?: string }> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // Call server to generate 6-digit code, store with 10 min expiry, and email via Gmail SMTP
    const resp = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizedEmail,
        purpose
      })
    });

    let data: any = {};
    try {
      data = await resp.json();
    } catch {
      const text = await resp.text().catch(() => '');
      data = { error: text };
    }

    if (!resp.ok || !data.success || !data.emailDelivered) {
      const errMsg = data.error || data.message || 'Failed to dispatch verification code to your email.';
      return { 
        success: false, 
        emailDelivered: false,
        error: errMsg 
      };
    }

    return { 
      success: true, 
      emailDelivered: true, 
      notice: `Verification code dispatched to ${normalizedEmail} via Gmail. Please check your inbox.`
    };
  } catch (err: unknown) {
    const error = err as { message?: string };
    return { success: false, error: error.message || 'Failed to dispatch OTP.' };
  }
}

/**
 * Validates the entered OTP code against the backend /api/verify-otp endpoint
 * before allowing account creation.
 */
export async function verifyEmailOtp(
  email: string,
  enteredOtp: string,
  purpose: OtpPurpose
): Promise<{ valid: boolean; error?: string; message?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanCode = enteredOtp.trim();

  if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
    return { valid: false, error: 'Please enter a valid 6-digit verification code.' };
  }

  // 1. Primary validation: Validate against server-side /api/verify-otp endpoint
  try {
    const resp = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizedEmail,
        otp: cleanCode,
        purpose
      })
    });

    const data = await resp.json().catch(() => ({}));

    if (resp.ok && data.valid) {
      // Clear local cache & Firestore document upon successful verification
      otpCache.delete(normalizedEmail);
      const docKey = sanitizeEmailKey(normalizedEmail);
      deleteDoc(doc(db, 'otps', docKey)).catch(() => {});
      return { valid: true, message: data.message };
    }

    if (!resp.ok) {
      // Server explicitly validated and rejected the OTP (expired, mismatch, etc.)
      return { valid: false, error: data.error || 'Verification code failed.' };
    }
  } catch (serverErr) {
    console.warn('Backend /api/verify-otp fetch notice, attempting database verification fallback:', serverErr);
  }

  // 2. Resilient Database & Cache fallback (e.g. if network or container proxy briefly blips)
  const cached = otpCache.get(normalizedEmail);
  if (cached) {
    if (cached.expiresAt < Date.now()) {
      otpCache.delete(normalizedEmail);
      return { valid: false, error: 'This verification code has expired (10 minutes limit). Please request a new OTP.' };
    }
    if (cached.purpose === purpose && cached.otp === cleanCode) {
      otpCache.delete(normalizedEmail);
      const docKey = sanitizeEmailKey(normalizedEmail);
      deleteDoc(doc(db, 'otps', docKey)).catch(() => {});
      return { valid: true };
    }
  }

  try {
    const docKey = sanitizeEmailKey(normalizedEmail);
    const docSnap = await getDoc(doc(db, 'otps', docKey));

    if (!docSnap.exists()) {
      return { valid: false, error: 'No active OTP verification session found for this email. Please request a new OTP.' };
    }

    const data = docSnap.data() as OTPVerification;

    if (data.used) {
      return { valid: false, error: 'This verification code has already been used.' };
    }

    if (new Date(data.expiresAt).getTime() < Date.now()) {
      return { valid: false, error: 'Verification code has expired (10 minutes limit). Please request a new code.' };
    }

    if (data.otp !== cleanCode) {
      return { valid: false, error: 'Incorrect verification code. Please check your email and try again.' };
    }

    // Mark as used & delete
    await deleteDoc(doc(db, 'otps', docKey)).catch(() => {});
    otpCache.delete(normalizedEmail);

    return { valid: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { valid: false, error: err.message || 'Verification failed. Please retry.' };
  }
}
