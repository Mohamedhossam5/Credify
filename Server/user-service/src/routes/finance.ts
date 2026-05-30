import { Router, Response } from "express";
import { body, validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";
import Account from "../models/Account";
import Transaction from "../models/Transaction";
import User from "../models/User";
import Beneficiary from "../models/Beneficiary";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";
import { generateOtp, verifyOtp } from "../services/otp";
import { sendEmail, buildOtpEmailHtml } from "../services/brevo";
import { sendSms } from "../services/sms";

const router = Router();

// ─── Fee configuration ──────────────────────────────────────
const TRANSFER_FEE_RATE = 0.001; // 0.1% fee on every transfer

// ─── Pending-transfer store (in-memory, expires with OTP) ───

interface PendingTransfer {
  userId: number;
  email: string;
  type: string;
  amount: number;
  fee: number;
  recipientName: string;
  recipientAccount: string;
  recipientBank?: string;
  swiftCode?: string;
  recipientAddress?: string;
  reference?: string;
  createdAt: number;
}

const PENDING_TTL_MS = 5 * 60 * 1000; // 5 minutes
const pendingTransfers = new Map<string, PendingTransfer>();

// Cleanup expired entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of pendingTransfers) {
    if (now - entry.createdAt > PENDING_TTL_MS) {
      pendingTransfers.delete(id);
    }
  }
}, 60_000);

// ─── Shared validation ──────────────────────────────────────

const transferValidation = [
  body("type").isIn(["SAME_BANK", "DOMESTIC", "INTERNATIONAL", "BILL_PAYMENT"]).withMessage("Invalid transfer type"),
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
  body("recipientName").notEmpty().withMessage("Recipient name is required"),
  body("recipientAccount").notEmpty().withMessage("Recipient account is required"),
];

// ─── POST /transfer/initiate ─────────────────────────────────
// Validate transfer, send OTP, return transferId

router.post("/transfer/initiate", authenticate, transferValidation, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation failed for /transfer/initiate', req.body, errors.array());
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { type, amount, recipientName, recipientAccount, recipientBank, swiftCode, recipientAddress, reference } = req.body;
    const userId = req.user!.id;

    // Type-specific validation
    if (type === "DOMESTIC" && !recipientBank) {
      res.status(400).json({ error: "Bank name is required for domestic transfers." });
      return;
    }
    if (type === "INTERNATIONAL") {
      if (!recipientBank) { res.status(400).json({ error: "Bank name is required for international transfers." }); return; }
      if (!swiftCode) { res.status(400).json({ error: "SWIFT code is required for international transfers." }); return; }
      if (!recipientAddress) { res.status(400).json({ error: "Bank address is required for international transfers." }); return; }
    }

    // Verify sender account exists
    const senderAccount = await Account.findByUserId(userId);
    if (!senderAccount) {
      res.status(404).json({ error: "Sender account not found." });
      return;
    }

    // Self-transfer check
    if (type === "SAME_BANK" && recipientAccount === senderAccount.account_id) {
      res.status(400).json({ error: "You cannot transfer to your own account." });
      return;
    }

    // Calculate 0.1% fee with min 0.5 and max 20 EGP
    const parsedAmount = parseFloat(amount);
    let fee = Math.round(parsedAmount * TRANSFER_FEE_RATE * 100) / 100;
    if (parsedAmount > 0) {
      if (fee < 0.5) fee = 0.5;
      if (fee > 20) fee = 20;
    }
    const totalDebit = parsedAmount + fee;

    // Quick balance check (will re-check at confirm time under lock)
    if (parseFloat(String(senderAccount.balance)) < totalDebit) {
      res.status(400).json({ error: `Insufficient balance. Transfer amount: ${parsedAmount}, fee: ${fee}, total required: ${totalDebit}.` });
      return;
    }

    // Fetch user for OTP email
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }



    // ─── Regular user: store pending transfer and send OTP ────
    const transferId = uuidv4();
    pendingTransfers.set(transferId, {
      userId,
      email: user.email,
      type,
      amount: parsedAmount,
      fee,
      recipientName,
      recipientAccount,
      recipientBank,
      swiftCode,
      recipientAddress,
      reference,
      createdAt: Date.now(),
    });

    // Generate and send OTP
    const otp = generateOtp(user.email);

    // try {
    //   await sendEmail({
    //     to: user.email,
    //     toName: `${user.first_name} ${user.last_name}`,
    //     subject: "Your CredifyBank Transfer Verification Code",
    //     htmlContent: buildOtpEmailHtml(otp, user.first_name),
    //     otp,
    //   });
    // } catch (emailErr) {
    //   console.error("[Transfer Initiate] Failed to send OTP email:", emailErr);
    //   pendingTransfers.delete(transferId);
    //   res.status(500).json({ error: "Failed to send verification email. Please try again." });
    //   return;
    // }

    // MOCK: Use SMS gateway for email OTPs while Brevo is disabled
    sendSms(user.email, otp);

    res.json({
      message: "Transfer verification code sent to your email.",
      transferId,
      otpRequired: true,
    });
  } catch (err) {
    console.error("[Transfer Initiate Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── POST /transfer/confirm ─────────────────────────────────
// Verify OTP, execute the pending transfer

router.post("/transfer/confirm", authenticate, [
  body("transferId").notEmpty().withMessage("Transfer ID is required"),
  body("otp").trim().isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { transferId, otp } = req.body;
    const userId = req.user!.id;

    // Look up pending transfer
    const pending = pendingTransfers.get(transferId);
    if (!pending) {
      res.status(404).json({ error: "Transfer not found or has expired. Please initiate a new transfer." });
      return;
    }

    // Ensure the transfer belongs to the authenticated user
    if (pending.userId !== userId) {
      res.status(403).json({ error: "Unauthorized." });
      return;
    }

    // Check expiry
    if (Date.now() - pending.createdAt > PENDING_TTL_MS) {
      pendingTransfers.delete(transferId);
      res.status(410).json({ error: "Transfer has expired. Please initiate a new transfer." });
      return;
    }

    // Verify OTP
    const isValid = verifyOtp(pending.email, otp);
    if (!isValid) {
      res.status(401).json({ error: "Invalid or expired verification code." });
      return;
    }

    // Execute the transfer
    const senderAccount = await Account.findByUserId(userId);
    if (!senderAccount) {
      pendingTransfers.delete(transferId);
      res.status(404).json({ error: "Sender account not found." });
      return;
    }

    const receiverInternalId = pending.type === "SAME_BANK" ? pending.recipientAccount : undefined;

    const transferRes = await Account.transferFunds(userId, pending.amount, receiverInternalId, pending.fee);
    if (!transferRes.success) {
      pendingTransfers.delete(transferId);
      res.status(400).json({ error: transferRes.error });
      return;
    }

    const transaction = await Transaction.create({
      senderId: userId,
      senderAccountId: senderAccount.account_id,
      type: pending.type,
      amount: pending.amount,
      fee: pending.fee,
      recipientName: pending.recipientName,
      recipientAccount: pending.recipientAccount,
      recipientBank: pending.recipientBank,
      swiftCode: pending.swiftCode,
      recipientAddress: pending.recipientAddress,
      reference: pending.reference,
    });

    // Clean up
    pendingTransfers.delete(transferId);

    res.json({ message: "Transfer successful.", transaction });
  } catch (err) {
    console.error("[Transfer Confirm Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── Beneficiaries ──────────────────────────────────────────

router.get("/transfer/beneficiaries", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const beneficiaries = await Beneficiary.findByUserId(userId);
    res.json({ beneficiaries });
  } catch (err) {
    console.error("[Get Beneficiaries Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/transfer/beneficiaries", authenticate, [
  body("type").isIn(["SAME_BANK", "DOMESTIC", "INTERNATIONAL"]).withMessage("Invalid transfer type"),
  body("name").notEmpty().withMessage("Beneficiary name is required"),
  body("accountNumber").notEmpty().withMessage("Account number is required"),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { type, name, accountNumber, bankName, swiftCode, address } = req.body;
    const userId = req.user!.id;

    if (type === "DOMESTIC" && !bankName) {
      res.status(400).json({ error: "Bank name is required for domestic beneficiaries." });
      return;
    }
    if (type === "INTERNATIONAL") {
      if (!bankName) { res.status(400).json({ error: "Bank name is required for international beneficiaries." }); return; }
      if (!swiftCode) { res.status(400).json({ error: "SWIFT code is required for international beneficiaries." }); return; }
      if (!address) { res.status(400).json({ error: "Address is required for international beneficiaries." }); return; }
    }

    const beneficiary = await Beneficiary.create({
      userId,
      type,
      name,
      accountNumber,
      bankName,
      swiftCode,
      address,
    });

    res.status(201).json({ message: "Beneficiary saved successfully.", beneficiary });
  } catch (err: any) {
    console.error("[Add Beneficiary Error]", err);
    require('fs').appendFileSync('beneficiary_error.log', new Date().toISOString() + ' ' + (err.stack || err.message) + '\\n');
    res.status(500).json({ error: "Internal server error." });
  }
});

router.delete("/transfer/beneficiaries/:id", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const beneficiaryId = parseInt(req.params.id, 10);
    const success = await Beneficiary.delete(beneficiaryId, userId);
    
    if (success) {
      res.json({ message: "Beneficiary deleted successfully." });
    } else {
      res.status(404).json({ error: "Beneficiary not found." });
    }
  } catch (err) {
    console.error("[Delete Beneficiary Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── GET /transactions ──────────────────────────────────────

router.get("/transactions", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const user = await User.findById(req.user!.id);
    let transactions;
    if (user?.role === 'ADMIN' && req.query.global === 'true') {
      transactions = await Transaction.findAll(limit);
    } else {
      const account = await Account.findByUserId(req.user!.id);
      transactions = await Transaction.findByUserIdAndAccount(req.user!.id, account?.account_id, limit);
    }
    res.json({ transactions });
  } catch(err) {
    console.error("[Transactions Fetch Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── GET /fx-rates ──────────────────────────────────────────

router.get("/fx-rates", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const API_KEY = "4c467a1682-48ba6f1415-tdjq8e";
    const response = await fetch(`https://api.fastforex.io/fetch-all?from=EGP&api_key=${API_KEY}`);
    const data = await response.json() as any;
    
    res.json({
      updated: data.updated || new Date().toISOString(),
      results: data.results || {}
    });
  } catch (err) {
    console.error("[FX Rates Error]", err);
    res.status(500).json({ error: "Failed to fetch live FX rates." });
  }
});

export default router;
