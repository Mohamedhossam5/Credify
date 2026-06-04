import { describe, test, expect } from "vitest";
import {
  loginSchema,
  registerStep1Schema,
  registerStep2Schema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../../schemas/auth";

// ─── loginSchema ─────────────────────────────────────────────

describe("loginSchema", () => {
  test("accepts valid email + password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "mypassword",
    });
    expect(result.success).toBe(true);
  });

  test("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "mypassword",
    });
    expect(result.success).toBe(false);
  });

  test("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  test("lowercases email", () => {
    const result = loginSchema.safeParse({
      email: "User@EXAMPLE.COM",
      password: "pass",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });
});

// ─── registerStep1Schema ─────────────────────────────────────

describe("registerStep1Schema", () => {
  const validStep1 = {
    firstName: "Mohamed",
    lastName: "Ahmed",
    email: "mohamed@test.com",
    phone: "01012345678",
    nationalId: "30001011234517", // 14 digits starting with 2 or 3
    gender: "male" as const,
  };

  test("accepts valid step 1 data", () => {
    const result = registerStep1Schema.safeParse(validStep1);
    expect(result.success).toBe(true);
  });

  test("normalises Egyptian phone number to +20 format", () => {
    const result = registerStep1Schema.safeParse(validStep1);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+201012345678");
    }
  });

  test("normalises phone with +20 prefix", () => {
    const result = registerStep1Schema.safeParse({
      ...validStep1,
      phone: "+201012345678",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+201012345678");
    }
  });

  test("normalises phone with spaces and dashes", () => {
    const result = registerStep1Schema.safeParse({
      ...validStep1,
      phone: "010-1234 5678",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+201012345678");
    }
  });

  test("rejects invalid phone number", () => {
    const result = registerStep1Schema.safeParse({
      ...validStep1,
      phone: "123456",
    });
    expect(result.success).toBe(false);
  });

  test("rejects first name shorter than 2 chars", () => {
    const result = registerStep1Schema.safeParse({
      ...validStep1,
      firstName: "A",
    });
    expect(result.success).toBe(false);
  });

  test("rejects first name with numbers", () => {
    const result = registerStep1Schema.safeParse({
      ...validStep1,
      firstName: "John123",
    });
    expect(result.success).toBe(false);
  });

  test("rejects national ID shorter than 14 digits", () => {
    const result = registerStep1Schema.safeParse({
      ...validStep1,
      nationalId: "1234567890123", // 13 digits
    });
    expect(result.success).toBe(false);
  });

  test("rejects national ID starting with digit other than 2 or 3", () => {
    const result = registerStep1Schema.safeParse({
      ...validStep1,
      nationalId: "10001011234567", // starts with 1
    });
    expect(result.success).toBe(false);
  });

  test("rejects invalid gender", () => {
    const result = registerStep1Schema.safeParse({
      ...validStep1,
      gender: "other",
    });
    expect(result.success).toBe(false);
  });

  test("allows optional middleName", () => {
    const result = registerStep1Schema.safeParse({
      ...validStep1,
      middleName: "Ali",
    });
    expect(result.success).toBe(true);
  });

  test("allows empty string middleName", () => {
    const result = registerStep1Schema.safeParse({
      ...validStep1,
      middleName: "",
    });
    expect(result.success).toBe(true);
  });
});

// ─── registerStep2Schema ─────────────────────────────────────

describe("registerStep2Schema", () => {
  const validStep2 = {
    address: "123 Cairo Street, Nasr City, Cairo",
    dob: "2000-01-01",
    password: "SecurePass123!",
    confirmPassword: "SecurePass123!",
  };

  test("accepts valid step 2 data", () => {
    const result = registerStep2Schema.safeParse(validStep2);
    expect(result.success).toBe(true);
  });

  test("rejects address shorter than 10 characters", () => {
    const result = registerStep2Schema.safeParse({
      ...validStep2,
      address: "Short",
    });
    expect(result.success).toBe(false);
  });

  test("rejects password shorter than 12 characters", () => {
    const result = registerStep2Schema.safeParse({
      ...validStep2,
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  test("rejects mismatched passwords", () => {
    const result = registerStep2Schema.safeParse({
      ...validStep2,
      password: "SecurePass123!",
      confirmPassword: "DifferentPass!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("confirmPassword");
    }
  });

  test("rejects birthdate making user younger than 18", () => {
    // Use a date that's definitely less than 18 years ago
    const recentDate = new Date();
    recentDate.setFullYear(recentDate.getFullYear() - 10);
    const result = registerStep2Schema.safeParse({
      ...validStep2,
      dob: recentDate.toISOString().split("T")[0],
    });
    expect(result.success).toBe(false);
  });

  test("accepts birthdate of exactly 18+ years old", () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 19); // 19 years old = definitely valid
    const result = registerStep2Schema.safeParse({
      ...validStep2,
      dob: dob.toISOString().split("T")[0],
    });
    expect(result.success).toBe(true);
  });

  test("rejects future birthdate", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const result = registerStep2Schema.safeParse({
      ...validStep2,
      dob: future.toISOString().split("T")[0],
    });
    expect(result.success).toBe(false);
  });
});

// ─── forgotPasswordSchema ────────────────────────────────────

describe("forgotPasswordSchema", () => {
  test("accepts valid email + 14-digit national ID", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "user@example.com",
      idNumber: "30001011234567",
    });
    expect(result.success).toBe(true);
  });

  test("rejects non-14-digit national ID", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "user@example.com",
      idNumber: "123456",
    });
    expect(result.success).toBe(false);
  });

  test("rejects national ID with letters", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "user@example.com",
      idNumber: "3000101123456a",
    });
    expect(result.success).toBe(false);
  });

  test("rejects invalid email", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "bad-email",
      idNumber: "30001011234567",
    });
    expect(result.success).toBe(false);
  });
});

// ─── resetPasswordSchema ─────────────────────────────────────

describe("resetPasswordSchema", () => {
  test("accepts matching passwords that meet length requirement", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "NewSecurePass1!",
      confirmPassword: "NewSecurePass1!",
    });
    expect(result.success).toBe(true);
  });

  test("rejects short password", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  test("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "NewSecurePass1!",
      confirmPassword: "DifferentPass1!",
    });
    expect(result.success).toBe(false);
  });
});
