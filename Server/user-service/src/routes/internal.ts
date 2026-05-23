import { Router, Request, Response } from "express";
import User from "../models/User";
import Account from "../models/Account";

const router = Router();

// GET /api/internal/users
router.get("/users", async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.findAll();
    res.json({ users });
  } catch (err: any) {
    console.error("[Internal] Error fetching users:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/internal/users/:id/kyc-status
// Generic endpoint to update a user's kyc_status from any service.
router.post("/users/:id/kyc-status", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID." });
      return;
    }

    const { status } = req.body || {};
    if (!status) {
      res.status(400).json({ error: "Missing 'status' in request body." });
      return;
    }

    await User.updateKycStatus(userId, status);
    res.json({ message: `User kyc_status updated to ${status}.` });
  } catch (err: any) {
    console.error("[Internal] Error updating KYC status:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/internal/users/:id/kyc-approved
// Kept separately because it also creates the bank account.
router.post("/users/:id/kyc-approved", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id, 10);

    // Update user kyc_status
    await User.updateKycStatus(userId, "APPROVED");

    // Produce account if it doesn't already exist
    let account = await Account.findByUserId(userId);
    if (!account) {
      account = await Account.create(userId);
    }

    res.json({ message: "User KYC approved and account ready.", account });
  } catch (err: any) {
    console.error("[Internal] Error approving KYC:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/internal/users/:id/verification-status
router.get("/users/:id/verification-status", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID." });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.json({
      userId: user.id,
      phoneVerified: user.phone_verified,
      emailVerified: user.email_verified,
      fullyVerified: user.phone_verified && user.email_verified,
    });
  } catch (err: any) {
    console.error("[Internal] Error fetching verification status:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// PUT /api/internal/users/:id/unlock
router.put("/users/:id/unlock", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID." });
      return;
    }

    await User.unlockAccount(userId);
    res.json({ message: "User account unlocked successfully." });
  } catch (err: any) {
    console.error("[Internal] Error unlocking account:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
