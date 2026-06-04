import { generateOtp, verifyOtp, generateKeyedOtp, verifyKeyedOtp } from "../../services/otp";

// ─── generateOtp / verifyOtp (login-scoped) ─────────────────

describe("OTP Service — login-scoped helpers", () => {
  test("generateOtp returns a 6-digit numeric string", () => {
    const code = generateOtp("user@example.com");
    expect(code).toMatch(/^\d{6}$/);
  });

  test("verifyOtp returns true for a correct, unexpired code", () => {
    const code = generateOtp("alice@test.com");
    expect(verifyOtp("alice@test.com", code)).toBe(true);
  });

  test("verifyOtp returns false for a wrong code", () => {
    generateOtp("bob@test.com");
    expect(verifyOtp("bob@test.com", "000000")).toBe(false);
  });

  test("OTP is consumed after successful verification (one-time use)", () => {
    const code = generateOtp("carol@test.com");
    expect(verifyOtp("carol@test.com", code)).toBe(true);
    // Second attempt with the same code must fail
    expect(verifyOtp("carol@test.com", code)).toBe(false);
  });

  test("verifyOtp returns false when no OTP was ever generated", () => {
    expect(verifyOtp("nobody@test.com", "123456")).toBe(false);
  });

  test("identifier matching is case-insensitive", () => {
    const code = generateOtp("Case@Test.COM");
    expect(verifyOtp("case@test.com", code)).toBe(true);
  });
});

// ─── generateKeyedOtp / verifyKeyedOtp (arbitrary purpose) ──

describe("OTP Service — keyed (multi-purpose) helpers", () => {
  test("generateKeyedOtp returns a 6-digit numeric string", () => {
    const code = generateKeyedOtp("phone", "+201012345678");
    expect(code).toMatch(/^\d{6}$/);
  });

  test("verifyKeyedOtp succeeds with the correct purpose + identifier + code", () => {
    const code = generateKeyedOtp("email-verify", "dave@test.com");
    expect(verifyKeyedOtp("email-verify", "dave@test.com", code)).toBe(true);
  });

  test("OTPs for different purposes do not collide", () => {
    const loginCode = generateKeyedOtp("login", "eve@test.com");
    const phoneCode = generateKeyedOtp("phone", "eve@test.com");

    // Each code should only verify under its own purpose
    expect(verifyKeyedOtp("login", "eve@test.com", phoneCode)).toBe(false);
    expect(verifyKeyedOtp("phone", "eve@test.com", loginCode)).toBe(false);

    // The correct pairs still work
    // Note: loginCode was NOT consumed above (wrong code → no deletion)
    expect(verifyKeyedOtp("login", "eve@test.com", loginCode)).toBe(true);
    expect(verifyKeyedOtp("phone", "eve@test.com", phoneCode)).toBe(true);
  });

  test("a new OTP overwrites the previous one for the same purpose + identifier", () => {
    const first = generateKeyedOtp("phone", "+201099999999");
    const second = generateKeyedOtp("phone", "+201099999999");

    expect(first).not.toBe(second); // extremely unlikely to collide
    expect(verifyKeyedOtp("phone", "+201099999999", first)).toBe(false);
    expect(verifyKeyedOtp("phone", "+201099999999", second)).toBe(true);
  });

  test("expired OTP returns false", () => {
    const code = generateKeyedOtp("phone", "+201000000000");

    // Fast-forward time past the 5-minute TTL
    const realNow = Date.now;
    Date.now = () => realNow() + 6 * 60 * 1000; // 6 minutes later

    expect(verifyKeyedOtp("phone", "+201000000000", code)).toBe(false);

    // Restore
    Date.now = realNow;
  });
});
