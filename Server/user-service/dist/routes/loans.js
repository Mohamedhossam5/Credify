"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const Loan_1 = __importDefault(require("../models/Loan"));
const Account_1 = __importDefault(require("../models/Account"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// ─── GET /loans/calculate ────────────────────────────────────
// Public preview: calculate repayment for given amount & tenure
router.get("/calculate", auth_1.authenticate, async (req, res) => {
    try {
        const amount = parseFloat(req.query.amount);
        const tenure = parseInt(req.query.tenure, 10);
        if (!amount || amount < 5000 || amount > 1000000) {
            res.status(400).json({ error: "Amount must be between 5,000 and 1,000,000 EGP." });
            return;
        }
        if (!tenure || ![6, 12, 24, 36, 48, 60].includes(tenure)) {
            res.status(400).json({ error: "Tenure must be 6, 12, 24, 36, 48, or 60 months." });
            return;
        }
        const calculation = Loan_1.default.calculateLoan(amount, tenure);
        const schedule = Loan_1.default.generateSchedule(amount, calculation.interestRate, tenure);
        res.json({ ...calculation, schedule });
    }
    catch (err) {
        console.error("[Loan Calculate Error]", err);
        res.status(500).json({ error: "Internal server error." });
    }
});
// ─── POST /loans/apply ───────────────────────────────────────
// User submits a loan application
router.post("/apply", auth_1.authenticate, auth_1.requireActiveUser, [
    (0, express_validator_1.body)("amount").isFloat({ min: 5000, max: 1000000 }).withMessage("Amount must be between 5,000 and 1,000,000 EGP"),
    (0, express_validator_1.body)("tenure").isInt().isIn([6, 12, 24, 36, 48, 60]).withMessage("Tenure must be 6, 12, 24, 36, 48, or 60 months"),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { amount, tenure, purpose } = req.body;
        const userId = req.user.id;
        // Check if user already has 2 PENDING or ACTIVE loans
        const existingLoans = await Loan_1.default.findByUserId(userId);
        const activeOrPendingLoans = existingLoans.filter((l) => l.status === "PENDING" || l.status === "ACTIVE");
        if (activeOrPendingLoans.length >= 2) {
            res.status(400).json({ error: "You have reached the maximum limit of 2 active or pending loans." });
            return;
        }
        // Calculate loan details
        const calc = Loan_1.default.calculateLoan(amount, tenure);
        // Create loan record
        const loan = await Loan_1.default.create(userId, calc.amount, calc.tenureMonths, calc.interestRate, calc.monthlyPayment, calc.totalRepayment, calc.totalInterest, calc.adminFee, purpose);
        res.status(201).json({
            message: "Loan application submitted successfully. Awaiting admin approval.",
            loan,
        });
    }
    catch (err) {
        console.error("[Loan Apply Error]", err);
        res.status(500).json({ error: "Internal server error." });
    }
});
// ─── GET /loans/my ───────────────────────────────────────────
// Get all loans for the current user
router.get("/my", auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const loans = await Loan_1.default.findByUserId(userId);
        res.json({ loans });
    }
    catch (err) {
        console.error("[Loan My Error]", err);
        res.status(500).json({ error: "Internal server error." });
    }
});
// ─── GET /loans/all ──────────────────────────────────────────
// Admin: get all loan applications
router.get("/all", auth_1.authenticate, async (req, res) => {
    try {
        // Verify admin role
        const user = await User_1.default.findById(req.user.id);
        if (!user || user.role !== "ADMIN") {
            res.status(403).json({ error: "Admin access required." });
            return;
        }
        const statusFilter = req.query.status;
        const loans = await Loan_1.default.findAll(statusFilter);
        res.json({ loans });
    }
    catch (err) {
        console.error("[Loan All Error]", err);
        res.status(500).json({ error: "Internal server error." });
    }
});
// ─── POST /loans/:id/approve ─────────────────────────────────
// Admin: approve a loan and disburse funds
router.post("/:id/approve", auth_1.authenticate, async (req, res) => {
    try {
        // Verify admin role
        const adminUser = await User_1.default.findById(req.user.id);
        if (!adminUser || adminUser.role !== "ADMIN") {
            res.status(403).json({ error: "Admin access required." });
            return;
        }
        const loanId = parseInt(req.params.id, 10);
        const loan = await Loan_1.default.findById(loanId);
        if (!loan) {
            res.status(404).json({ error: "Loan not found." });
            return;
        }
        if (loan.status !== "PENDING") {
            res.status(400).json({ error: `Loan is already ${loan.status.toLowerCase()}.` });
            return;
        }
        // Approve the loan
        const updatedLoan = await Loan_1.default.updateStatus(loanId, "APPROVED");
        // Disburse funds: credit (amount - admin_fee) to user's account
        const account = await Account_1.default.findByUserId(loan.user_id);
        if (account) {
            const disbursement = parseFloat(String(loan.amount)) - parseFloat(String(loan.admin_fee));
            await db_1.default.query("UPDATE accounts SET balance = balance + $1 WHERE user_id = $2", [disbursement, loan.user_id]);
            // Update loan to mark disbursement
            await db_1.default.query("UPDATE loans SET disbursed_at = NOW(), status = 'ACTIVE' WHERE id = $1", [loanId]);
        }
        res.json({ message: "Loan approved and funds disbursed.", loan: updatedLoan });
    }
    catch (err) {
        console.error("[Loan Approve Error]", err);
        res.status(500).json({ error: "Internal server error." });
    }
});
// ─── POST /loans/:id/reject ─────────────────────────────────
// Admin: reject a loan application
router.post("/:id/reject", auth_1.authenticate, async (req, res) => {
    try {
        // Verify admin role
        const adminUser = await User_1.default.findById(req.user.id);
        if (!adminUser || adminUser.role !== "ADMIN") {
            res.status(403).json({ error: "Admin access required." });
            return;
        }
        const loanId = parseInt(req.params.id, 10);
        const loan = await Loan_1.default.findById(loanId);
        if (!loan) {
            res.status(404).json({ error: "Loan not found." });
            return;
        }
        if (loan.status !== "PENDING") {
            res.status(400).json({ error: `Loan is already ${loan.status.toLowerCase()}.` });
            return;
        }
        const reason = req.body?.reason || "Application does not meet requirements.";
        const updatedLoan = await Loan_1.default.updateStatus(loanId, "REJECTED", reason);
        res.json({ message: "Loan rejected.", loan: updatedLoan });
    }
    catch (err) {
        console.error("[Loan Reject Error]", err);
        res.status(500).json({ error: "Internal server error." });
    }
});
exports.default = router;
// Need pool for direct queries in approve route
const db_1 = __importDefault(require("../config/db"));
