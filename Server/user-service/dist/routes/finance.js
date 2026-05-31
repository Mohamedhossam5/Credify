"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const uuid_1 = require("uuid");
const Account_1 = __importDefault(require("../models/Account"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const otp_1 = require("../services/otp");
const sms_1 = require("../services/sms");
const router = (0, express_1.Router)();
// ─── Fee configuration ──────────────────────────────────────
const TRANSFER_FEE_RATE = 0.01; // 1% fee on every transfer
const PENDING_TTL_MS = 5 * 60 * 1000; // 5 minutes
const pendingTransfers = new Map();
// Cleanup expired entries every 60 seconds
setInterval(() => {
    const now = Date.now();
    for (const [id, entry] of pendingTransfers) {
        if (now - entry.createdAt > PENDING_TTL_MS) {
            pendingTransfers.delete(id);
        }
    }
}, 60000);
// ─── Shared validation ──────────────────────────────────────
const transferValidation = [
    (0, express_validator_1.body)("type").isIn(["SAME_BANK", "DOMESTIC", "INTERNATIONAL"]).withMessage("Invalid transfer type"),
    (0, express_validator_1.body)("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
    (0, express_validator_1.body)("recipientName").notEmpty().withMessage("Recipient name is required"),
    (0, express_validator_1.body)("recipientAccount").notEmpty().withMessage("Recipient account is required"),
];
// ─── POST /transfer/initiate ─────────────────────────────────
// Validate transfer, send OTP, return transferId
router.post("/transfer/initiate", auth_1.authenticate, transferValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { type, amount, recipientName, recipientAccount, recipientBank, swiftCode, recipientAddress, reference } = req.body;
        const userId = req.user.id;
        // Type-specific validation
        if (type === "DOMESTIC" && !recipientBank) {
            res.status(400).json({ error: "Bank name is required for domestic transfers." });
            return;
        }
        if (type === "INTERNATIONAL") {
            if (!recipientBank) {
                res.status(400).json({ error: "Bank name is required for international transfers." });
                return;
            }
            if (!swiftCode) {
                res.status(400).json({ error: "SWIFT code is required for international transfers." });
                return;
            }
            if (!recipientAddress) {
                res.status(400).json({ error: "Bank address is required for international transfers." });
                return;
            }
        }
        // Verify sender account exists
        const senderAccount = await Account_1.default.findByUserId(userId);
        if (!senderAccount) {
            res.status(404).json({ error: "Sender account not found." });
            return;
        }
        // Self-transfer check
        if (type === "SAME_BANK" && recipientAccount === senderAccount.account_id) {
            res.status(400).json({ error: "You cannot transfer to your own account." });
            return;
        }
        // Calculate 1% fee
        const parsedAmount = parseFloat(amount);
        const fee = Math.round(parsedAmount * TRANSFER_FEE_RATE * 100) / 100;
        const totalDebit = parsedAmount + fee;
        // Quick balance check (will re-check at confirm time under lock)
        if (parseFloat(String(senderAccount.balance)) < totalDebit) {
            res.status(400).json({ error: `Insufficient balance. Transfer amount: ${parsedAmount}, fee (1%): ${fee}, total required: ${totalDebit}.` });
            return;
        }
        // Fetch user for OTP email
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }
        // ─── Admin bypass: execute transfer immediately without OTP ───
        if (user.role === "ADMIN") {
            const receiverInternalId = type === "SAME_BANK" ? recipientAccount : undefined;
            const transferRes = await Account_1.default.transferFunds(userId, parsedAmount, receiverInternalId, fee);
            if (!transferRes.success) {
                res.status(400).json({ error: transferRes.error });
                return;
            }
            const transaction = await Transaction_1.default.create({
                senderId: userId,
                senderAccountId: senderAccount.account_id,
                type,
                amount: parsedAmount,
                fee,
                recipientName,
                recipientAccount,
                recipientBank,
                swiftCode,
                recipientAddress,
                reference,
            });
            res.json({ message: "Transfer successful.", otpRequired: false, transaction });
            return;
        }
        // ─── Regular user: store pending transfer and send OTP ────
        const transferId = (0, uuid_1.v4)();
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
        const otp = (0, otp_1.generateOtp)(user.email);
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
        (0, sms_1.sendSms)(user.email, otp);
        res.json({
            message: "Transfer verification code sent to your email.",
            transferId,
            otpRequired: true,
        });
    }
    catch (err) {
        console.error("[Transfer Initiate Error]", err);
        res.status(500).json({ error: "Internal server error." });
    }
});
// ─── POST /transfer/confirm ─────────────────────────────────
// Verify OTP, execute the pending transfer
router.post("/transfer/confirm", auth_1.authenticate, [
    (0, express_validator_1.body)("transferId").notEmpty().withMessage("Transfer ID is required"),
    (0, express_validator_1.body)("otp").trim().isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { transferId, otp } = req.body;
        const userId = req.user.id;
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
        const isValid = (0, otp_1.verifyOtp)(pending.email, otp);
        if (!isValid) {
            res.status(400).json({ error: "Invalid or expired verification code." });
            return;
        }
        // Execute the transfer
        const senderAccount = await Account_1.default.findByUserId(userId);
        if (!senderAccount) {
            pendingTransfers.delete(transferId);
            res.status(404).json({ error: "Sender account not found." });
            return;
        }
        const receiverInternalId = pending.type === "SAME_BANK" ? pending.recipientAccount : undefined;
        const transferRes = await Account_1.default.transferFunds(userId, pending.amount, receiverInternalId, pending.fee);
        if (!transferRes.success) {
            pendingTransfers.delete(transferId);
            res.status(400).json({ error: transferRes.error });
            return;
        }
        const transaction = await Transaction_1.default.create({
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
    }
    catch (err) {
        console.error("[Transfer Confirm Error]", err);
        res.status(500).json({ error: "Internal server error." });
    }
});
// ─── GET /transactions ──────────────────────────────────────
router.get("/transactions", auth_1.authenticate, async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const user = await User_1.default.findById(req.user.id);
        let transactions;
        if (user?.role === 'ADMIN' && req.query.global === 'true') {
            transactions = await Transaction_1.default.findAll(limit);
        }
        else {
            const account = await Account_1.default.findByUserId(req.user.id);
            transactions = await Transaction_1.default.findByUserIdAndAccount(req.user.id, account?.account_id, limit);
        }
        res.json({ transactions });
    }
    catch (err) {
        console.error("[Transactions Fetch Error]", err);
        res.status(500).json({ error: "Internal server error." });
    }
});
// ─── GET /fx-rates ──────────────────────────────────────────
router.get("/fx-rates", auth_1.authenticate, async (req, res) => {
    try {
        const API_KEY = "4c467a1682-48ba6f1415-tdjq8e";
        const response = await fetch(`https://api.fastforex.io/fetch-all?from=EGP&api_key=${API_KEY}`);
        const data = await response.json();
        res.json({
            updated: data.updated || new Date().toISOString(),
            results: data.results || {}
        });
    }
    catch (err) {
        console.error("[FX Rates Error]", err);
        res.status(500).json({ error: "Failed to fetch live FX rates." });
    }
});
exports.default = router;
