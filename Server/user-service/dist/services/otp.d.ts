/**
 * Generate a 6-digit OTP for the given email and store it.
 * Any existing OTP for this email is overwritten.
 */
export declare function generateOtp(email: string): string;
/**
 * Verify the OTP for the given email.
 * Returns true if valid, false otherwise.
 * On success (or expiry), the entry is deleted.
 */
export declare function verifyOtp(email: string, code: string): boolean;
/**
 * Generate a 6-digit OTP for an arbitrary purpose + identifier.
 */
export declare function generateKeyedOtp(purpose: string, identifier: string): string;
/**
 * Verify an OTP for an arbitrary purpose + identifier.
 * Returns true if valid, false otherwise.
 * On success (or expiry), the entry is deleted.
 */
export declare function verifyKeyedOtp(purpose: string, identifier: string, code: string): boolean;
