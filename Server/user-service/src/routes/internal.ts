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

// POST /api/internal/users/:id/kyc-approved
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

    res.json({ message: "User KYC appproved and account ready.", account });
  } catch (err: any) {
    console.error("[Internal] Error approving KYC:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
