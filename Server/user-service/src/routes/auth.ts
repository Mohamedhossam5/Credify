import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Account from "../models/Account";
import { authenticate, generateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// ─── Validation rules ────────────────────────────────────────

const registerValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("idNumber").trim().notEmpty().withMessage("ID number is required"),
  body("birthdate").isISO8601().withMessage("Birthdate must be a valid date (YYYY-MM-DD)"),
  body("address").optional().trim(),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// ─── POST /api/auth/register ─────────────────────────────────

router.post("/register", registerValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { firstName, lastName, email, password, idNumber, birthdate, address } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: "A user with this email already exists." });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName, lastName, email, passwordHash,
      idNumber, birthdate, address: address || null,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully. Please proceed with KYC verification.",
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        kycStatus: user.kyc_status,
        role: user.role,
      },
      token,
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

// ─── POST /api/auth/login ────────────────────────────────────

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

    const token = generateToken(user);
    const account = await Account.findByUserId(user.id);

    res.json({
      message: "Login successful.",
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
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
    console.error("[Login] Error:", err);
    res.status(500).json({ error: "Internal server error." });
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
        lastName: user.last_name,
        email: user.email,
        idNumber: user.id_number,
        birthdate: user.birthdate,
        address: user.address,
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
