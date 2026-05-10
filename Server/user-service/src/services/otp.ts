// ─── In-memory OTP store with automatic expiry ──────────────

interface OtpEntry {
  code: string;
  expiresAt: number;
}

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const otpStore = new Map<string, OtpEntry>();

/**
 * Build a composite key so OTPs for different purposes don't collide.
 * Examples: "login:user@example.com", "phone:+201012345678", "email-verify:user@example.com"
 */
function buildKey(purpose: string, identifier: string): string {
  return `${purpose}:${identifier.toLowerCase()}`;
}

/**
 * Generate a 6-digit OTP for the given email and store it.
 * Any existing OTP for this email is overwritten.
 */
export function generateOtp(email: string): string {
  return generateKeyedOtp("login", email);
}

/**
 * Verify the OTP for the given email.
 * Returns true if valid, false otherwise.
 * On success (or expiry), the entry is deleted.
 */
export function verifyOtp(email: string, code: string): boolean {
  return verifyKeyedOtp("login", email, code);
}

/**
 * Generate a 6-digit OTP for an arbitrary purpose + identifier.
 */
export function generateKeyedOtp(purpose: string, identifier: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const key = buildKey(purpose, identifier);

  otpStore.set(key, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
  });

  return code;
}

/**
 * Verify an OTP for an arbitrary purpose + identifier.
 * Returns true if valid, false otherwise.
 * On success (or expiry), the entry is deleted.
 */
export function verifyKeyedOtp(purpose: string, identifier: string, code: string): boolean {
  const key = buildKey(purpose, identifier);
  const entry = otpStore.get(key);

  if (!entry) return false;

  // Expired
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(key);
    return false;
  }

  // Wrong code
  if (entry.code !== code) return false;

  // Valid — consume the OTP
  otpStore.delete(key);
  return true;
}
