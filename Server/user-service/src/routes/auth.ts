import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Account from "../models/Account";
import { authenticate, generateToken, AuthenticatedRequest } from "../middleware/auth";
import { generateOtp, verifyOtp, generateKeyedOtp, verifyKeyedOtp } from "../services/otp";
import { sendEmail, buildOtpEmailHtml } from "../services/brevo";
import { sendSms } from "../services/sms";

const router = Router();

// ─── Validation rules ────────────────────────────────────────

const registerValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("middleName").optional().trim(),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("confirmPassword").notEmpty().withMessage("Confirm password is required"),
  body("phoneNumber").trim().notEmpty().withMessage("Phone number is required"),
  body("gender").isIn(["MALE", "FEMALE"]).withMessage("Gender must be MALE or FEMALE"),
  body("idNumber")
    .trim()
    .notEmpty().withMessage("ID number is required")
    .matches(/^\d{14}$/).withMessage("ID number must be exactly 14 digits"),
  body("birthdate").isISO8601().withMessage("Birthdate must be a valid date (YYYY-MM-DD)"),
  body("address").optional().trim(),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const otpValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("otp").trim().isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
];

// ─── POST /api/auth/register ─────────────────────────────────

router.post("/register", registerValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { firstName, middleName, lastName, email, password, confirmPassword, phoneNumber, gender, idNumber, birthdate, address } = req.body;

    // ─── Confirm password check ───────────────────────────────
    if (password !== confirmPassword) {
      res.status(400).json({ error: "Passwords do not match." });
      return;
    }

    // ─── Egyptian National ID / Gender cross-validation ───────
    // The 13th digit (index 12) of the 14-digit ID determines gender:
    //   odd  → MALE
    //   even → FEMALE
    const thirteenthDigit = parseInt(idNumber[12], 10);
    const idImpliesGender = thirteenthDigit % 2 !== 0 ? "MALE" : "FEMALE";

    if (gender !== idImpliesGender) {
      res.status(400).json({
        error: `Gender mismatch: your national ID indicates ${idImpliesGender}, but you selected ${gender}.`,
      });
      return;
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: "A user with this email already exists." });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName, middleName: middleName || null, lastName, email, passwordHash,
      phoneNumber, gender, idNumber, birthdate, address: address || null,
    });

    const token = generateToken(user);

    // ─── Auto-send phone OTP after registration ────────────────
    const phoneOtp = generateKeyedOtp("phone", user.phone_number);
    sendSms(user.phone_number, phoneOtp);

    res.status(201).json({
      message: "User registered successfully. Please verify your phone number.",
      user: {
        id: user.id,
        firstName: user.first_name,
        middleName: user.middle_name,
        lastName: user.last_name,
        email: user.email,
        phoneNumber: user.phone_number,
        gender: user.gender,
        phoneVerified: false,
        emailVerified: false,
        kycStatus: user.kyc_status,
        role: user.role,
      },
      token,
      nextStep: "verify-phone",
    });
  } catch (err: any) {
    console.error("[Register] Error:", err);
    if (err.code === "23505") {
      res.status(409).json({ error: "A user with this ID number or email already exists." });
      return;
    }
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── POST /api/auth/send-phone-otp ──────────────────────────
// Send (or resend) a phone verification OTP via mock SMS gateway

router.post("/send-phone-otp", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    if (user.phone_verified) {
      res.status(400).json({ error: "Phone number is already verified." });
      return;
    }

    const otp = generateKeyedOtp("phone", user.phone_number);
    sendSms(user.phone_number, otp);

    res.json({ message: "Verification code sent to your phone number." });
  } catch (err) {
    console.error("[Send Phone OTP] Error:", err);
    res.status(500).json({ error: "Failed to send phone verification code." });
  }
});

// ─── POST /api/auth/verify-phone ────────────────────────────
// Verify the phone OTP and mark phone as verified

router.post("/verify-phone", [
  body("otp").trim().isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
], authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    if (user.phone_verified) {
      res.status(400).json({ error: "Phone number is already verified." });
      return;
    }

    const { otp } = req.body;
    const isValid = verifyKeyedOtp("phone", user.phone_number, otp);
    if (!isValid) {
      res.status(401).json({ error: "Invalid or expired verification code." });
      return;
    }

    await User.updatePhoneVerified(user.id);

    res.json({
      message: "Phone number verified successfully. Please verify your email next.",
      phoneVerified: true,
      nextStep: "verify-email",
    });
  } catch (err) {
    console.error("[Verify Phone] Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── POST /api/auth/send-email-otp ──────────────────────────
// Send (or resend) an email verification OTP via Brevo

router.post("/send-email-otp", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    if (user.email_verified) {
      res.status(400).json({ error: "Email is already verified." });
      return;
    }

    if (!user.phone_verified) {
      res.status(400).json({ error: "You must verify your phone number first." });
      return;
    }

    const otp = generateKeyedOtp("email-verify", user.email);

    // try {
    //   await sendEmail({
    //     to: user.email,
    //     toName: `${user.first_name} ${user.last_name}`,
    //     subject: "Verify Your CredifyBank Email",
    //     htmlContent: buildOtpEmailHtml(otp, user.first_name),
    //     otp,
    //   });
    // } catch (emailErr) {
    //   console.error("[Send Email OTP] Failed to send email:", emailErr);
    //   res.status(500).json({ error: "Failed to send verification email. Please try again." });
    //   return;
    // }
    
    // MOCK: Use SMS gateway for email OTPs while Brevo is disabled
    sendSms(user.email, otp);

    res.json({ message: "Verification code sent to your email address." });
  } catch (err) {
    console.error("[Send Email OTP] Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── POST /api/auth/verify-email ────────────────────────────
// Verify the email OTP and mark email as verified

router.post("/verify-email", [
  body("otp").trim().isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
], authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    if (user.email_verified) {
      res.status(400).json({ error: "Email is already verified." });
      return;
    }

    if (!user.phone_verified) {
      res.status(400).json({ error: "You must verify your phone number first." });
      return;
    }

    const { otp } = req.body;
    const isValid = verifyKeyedOtp("email-verify", user.email, otp);
    if (!isValid) {
      res.status(401).json({ error: "Invalid or expired verification code." });
      return;
    }

    await User.updateEmailVerified(user.id);

    res.json({
      message: "Email verified successfully. You can now proceed with KYC verification.",
      emailVerified: true,
      nextStep: "kyc",
    });
  } catch (err) {
    console.error("[Verify Email] Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── GET /api/auth/verification-status ──────────────────────
// Returns the current phone/email verification status

router.get("/verification-status", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    let nextStep: string | null = null;
    if (!user.phone_verified) nextStep = "verify-phone";
    else if (!user.email_verified) nextStep = "verify-email";
    else nextStep = "kyc";

    res.json({
      phoneVerified: user.phone_verified,
      emailVerified: user.email_verified,
      nextStep,
    });
  } catch (err) {
    console.error("[Verification Status] Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── POST /api/auth/login ────────────────────────────────────
// Step 1: Validate credentials → send OTP email → return otpRequired flag

router.post("/login", loginValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash!);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    // ─── Admin bypass: skip OTP entirely ─────────────────────
    if (user.role === "ADMIN") {
      const token = generateToken(user);
      const account = await Account.findByUserId(user.id);

      res.json({
        message: "Login successful.",
        otpRequired: false,
        user: {
          id: user.id,
          firstName: user.first_name,
          middleName: user.middle_name,
          lastName: user.last_name,
          email: user.email,
          phoneNumber: user.phone_number,
          gender: user.gender,
          phoneVerified: user.phone_verified,
          emailVerified: user.email_verified,
          kycStatus: user.kyc_status,
          role: user.role,
          account: account ? {
            accountId: account.account_id,
            balance: account.balance
          } : null
        },
        token,
      });
      return;
    }

    // ─── Regular user: generate OTP and send via Brevo ────────
    const otp = generateOtp(email);

    // try {
    //   await sendEmail({
    //     to: user.email,
    //     toName: `${user.first_name} ${user.last_name}`,
    //     subject: "Your CredifyBank Login Code",
    //     htmlContent: buildOtpEmailHtml(otp, user.first_name),
    //     otp,
    //   });
    // } catch (emailErr) {
    //   console.error("[Login] Failed to send OTP email:", emailErr);
    //   res.status(500).json({ error: "Failed to send verification email. Please try again." });
    //   return;
    // }

    // MOCK: Use SMS gateway for email OTPs while Brevo is disabled
    sendSms(user.email, otp);

    res.json({
      message: "Verification code sent to your email.",
      otpRequired: true,
      email: user.email,
    });
  } catch (err) {
    console.error("[Login] Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── POST /api/auth/verify-otp ──────────────────────────────
// Step 2: Validate OTP → return JWT token + user data

router.post("/verify-otp", otpValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, otp } = req.body;

    const isValid = verifyOtp(email, otp);
    if (!isValid) {
      res.status(401).json({ error: "Invalid or expired verification code." });
      return;
    }

    const user = await User.findByEmail(email);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const token = generateToken(user);
    const account = await Account.findByUserId(user.id);

    res.json({
      message: "Login successful.",
      user: {
        id: user.id,
        firstName: user.first_name,
        middleName: user.middle_name,
        lastName: user.last_name,
        email: user.email,
        phoneNumber: user.phone_number,
        gender: user.gender,
        phoneVerified: user.phone_verified,
        emailVerified: user.email_verified,
        kycStatus: user.kyc_status,
        role: user.role,
        account: account ? {
          accountId: account.account_id,
          balance: account.balance
        } : null
      },
      token,
    });
  } catch (err) {
    console.error("[Verify OTP] Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── POST /api/auth/resend-otp ──────────────────────────────
// Resend a fresh OTP to the user's email

router.post("/resend-otp", [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal whether the user exists — still return success
      res.json({ message: "If an account exists, a new code has been sent." });
      return;
    }

    const otp = generateOtp(email);

    // await sendEmail({
    //   to: user.email,
    //   toName: `${user.first_name} ${user.last_name}`,
    //   subject: "Your CredifyBank Login Code",
    //   htmlContent: buildOtpEmailHtml(otp, user.first_name),
    //   otp,
    // });

    // MOCK: Use SMS gateway for email OTPs while Brevo is disabled
    sendSms(user.email, otp);

    res.json({ message: "A new verification code has been sent to your email." });
  } catch (err) {
    console.error("[Resend OTP] Error:", err);
    res.status(500).json({ error: "Failed to resend verification code." });
  }
});

// ─── GET /api/auth/me ────────────────────────────────────────

router.get("/me", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const account = await Account.findByUserId(user.id);

    res.json({
      user: {
        id: user.id,
        firstName: user.first_name,
        middleName: user.middle_name,
        lastName: user.last_name,
        email: user.email,
        phoneNumber: user.phone_number,
        gender: user.gender,
        idNumber: user.id_number,
        birthdate: user.birthdate,
        address: user.address,
        phoneVerified: user.phone_verified,
        emailVerified: user.email_verified,
        kycStatus: user.kyc_status,
        role: user.role,
        createdAt: user.created_at,
        account: account ? {
          accountId: account.account_id,
          balance: account.balance
        } : null
      },
    });
  } catch (err) {
    console.error("[Me] Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
