import { Router, Response } from "express";
import { body, validationResult } from "express-validator";
import Loan from "../models/Loan";
import Account from "../models/Account";
import User from "../models/User";
import { authenticate, requireActiveUser, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// ─── GET /loans/calculate ────────────────────────────────────
// Public preview: calculate repayment for given amount & tenure

router.get("/calculate", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const amount = parseFloat(req.query.amount as string);
    const tenure = parseInt(req.query.tenure as string, 10);

    if (!amount || amount < 5000 || amount > 1000000) {
      res.status(400).json({ error: "Amount must be between 5,000 and 1,000,000 EGP." });
      return;
    }
    if (!tenure || ![6, 12, 24, 36, 48, 60].includes(tenure)) {
      res.status(400).json({ error: "Tenure must be 6, 12, 24, 36, 48, or 60 months." });
      return;
    }

    const calculation = Loan.calculateLoan(amount, tenure);
    const schedule = Loan.generateSchedule(amount, calculation.interestRate, tenure);

    res.json({ ...calculation, schedule });
  } catch (err) {
    console.error("[Loan Calculate Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── POST /loans/apply ───────────────────────────────────────
// User submits a loan application

router.post("/apply", authenticate, requireActiveUser, [
  body("amount").isFloat({ min: 5000, max: 1000000 }).withMessage("Amount must be between 5,000 and 1,000,000 EGP"),
  body("tenure").isInt().isIn([6, 12, 24, 36, 48, 60]).withMessage("Tenure must be 6, 12, 24, 36, 48, or 60 months"),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { amount, tenure, purpose } = req.body;
    const userId = req.user!.id;

    // Check if user already has 2 PENDING or ACTIVE loans
    const existingLoans = await Loan.findByUserId(userId);
    const activeOrPendingLoans = existingLoans.filter((l) => l.status === "PENDING" || l.status === "ACTIVE");
    if (activeOrPendingLoans.length >= 2) {
      res.status(400).json({ error: "You have reached the maximum limit of 2 active or pending loans." });
      return;
    }

    // Calculate loan details
    const calc = Loan.calculateLoan(amount, tenure);

    // Create loan record
    const loan = await Loan.create(
      userId,
      calc.amount,
      calc.tenureMonths,
      calc.interestRate,
      calc.monthlyPayment,
      calc.totalRepayment,
      calc.totalInterest,
      calc.adminFee,
      purpose
    );

    res.status(201).json({
      message: "Loan application submitted successfully. Awaiting admin approval.",
      loan,
    });
  } catch (err) {
    console.error("[Loan Apply Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── GET /loans/my ───────────────────────────────────────────
// Get all loans for the current user

router.get("/my", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const loans = await Loan.findByUserId(userId);
    res.json({ loans });
  } catch (err) {
    console.error("[Loan My Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── GET /loans/all ──────────────────────────────────────────
// Admin: get all loan applications

router.get("/all", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Verify admin role
    const user = await User.findById(req.user!.id);
    if (!user || user.role !== "ADMIN") {
      res.status(403).json({ error: "Admin access required." });
      return;
    }

    const statusFilter = req.query.status as string | undefined;
    const loans = await Loan.findAll(statusFilter);
    res.json({ loans });
  } catch (err) {
    console.error("[Loan All Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── POST /loans/:id/approve ─────────────────────────────────
// Admin: approve a loan and disburse funds

router.post("/:id/approve", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Verify admin role
    const adminUser = await User.findById(req.user!.id);
    if (!adminUser || adminUser.role !== "ADMIN") {
      res.status(403).json({ error: "Admin access required." });
      return;
    }

    const loanId = parseInt(req.params.id, 10);
    const loan = await Loan.findById(loanId);

    if (!loan) {
      res.status(404).json({ error: "Loan not found." });
      return;
    }

    if (loan.status !== "PENDING") {
      res.status(400).json({ error: `Loan is already ${loan.status.toLowerCase()}.` });
      return;
    }

    // Approve the loan
    const updatedLoan = await Loan.updateStatus(loanId, "APPROVED");

    // Disburse funds: credit (amount - admin_fee) to user's account
    const account = await Account.findByUserId(loan.user_id);
    if (account) {
      const disbursement = parseFloat(String(loan.amount)) - parseFloat(String(loan.admin_fee));
      await pool.query(
        "UPDATE accounts SET balance = balance + $1 WHERE user_id = $2",
        [disbursement, loan.user_id]
      );

      // Update loan to mark disbursement
      await pool.query(
        "UPDATE loans SET disbursed_at = NOW(), status = 'ACTIVE' WHERE id = $1",
        [loanId]
      );
    }

    res.json({ message: "Loan approved and funds disbursed.", loan: updatedLoan });
  } catch (err) {
    console.error("[Loan Approve Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── POST /loans/:id/reject ─────────────────────────────────
// Admin: reject a loan application

router.post("/:id/reject", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Verify admin role
    const adminUser = await User.findById(req.user!.id);
    if (!adminUser || adminUser.role !== "ADMIN") {
      res.status(403).json({ error: "Admin access required." });
      return;
    }

    const loanId = parseInt(req.params.id, 10);
    const loan = await Loan.findById(loanId);

    if (!loan) {
      res.status(404).json({ error: "Loan not found." });
      return;
    }

    if (loan.status !== "PENDING") {
      res.status(400).json({ error: `Loan is already ${loan.status.toLowerCase()}.` });
      return;
    }

    const reason = req.body?.reason || "Application does not meet requirements.";
    const updatedLoan = await Loan.updateStatus(loanId, "REJECTED", reason);

    res.json({ message: "Loan rejected.", loan: updatedLoan });
  } catch (err) {
    console.error("[Loan Reject Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;

// Need pool for direct queries in approve route
import pool from "../config/db";
