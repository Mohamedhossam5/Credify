import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import KycApplication from "../models/KycApplication";
import KycRequest from "../models/KycRequest";

const router = Router();

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3001";
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

// ─── Helper: sync user's kyc_status in user-service ──────────
async function syncUserKycStatus(userId: number, status: string): Promise<void> {
  try {
    await fetch(`${USER_SERVICE_URL}/api/internal/users/${userId}/kyc-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    console.error(`[KYC Sync] Failed to sync status '${status}' for user ${userId}:`, err);
  }
}

// GET /api/internal/kyc/all
router.get("/kyc/all", async (_req: Request, res: Response): Promise<void> => {
  try {
    const records = await KycApplication.findAll();
    // Extract just filenames from full paths for the admin frontend
    const mapped = records.map((r) => ({
      ...r,
      national_id_front_file: r.national_id_front ? path.basename(r.national_id_front) : null,
      national_id_back_file: r.national_id_back ? path.basename(r.national_id_back) : null,
      face_selfie_file: r.face_selfie ? path.basename(r.face_selfie) : null,
      proof_of_address_file: r.proof_of_address ? path.basename(r.proof_of_address) : null,
      digital_signature_file: r.digital_signature ? path.basename(r.digital_signature) : null,
    }));
    res.json({ records: mapped });
  } catch (err: any) {
    console.error("[Internal KYC] Error fetching records:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/internal/kyc/additional-requests
router.get("/kyc/additional-requests", async (_req: Request, res: Response): Promise<void> => {
  try {
    const requests = await KycRequest.findAllUploaded();
    res.json({ requests });
  } catch (err: any) {
    console.error("[Internal KYC Additional Requests] Error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/internal/kyc/images/:filename
router.get("/kyc/images/:filename", (req: Request, res: Response): void => {
  const filename = path.basename(req.params.filename); // sanitize
  const filePath = path.join(UPLOAD_DIR, filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "Image not found." });
    return;
  }

  res.sendFile(path.resolve(filePath));
});

// POST /api/internal/kyc/:userId/approve
router.post("/kyc/:userId/approve", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID." });
      return;
    }

    const app = await KycApplication.findByUserId(userId);
    if (!app) {
      res.status(404).json({ error: "KYC application not found." });
      return;
    }

    // Set KYC status to APPROVED
    await KycApplication.updateStatus(userId, "APPROVED");

    // Notify user-service to create bank account + update status
    try {
      await fetch(`${USER_SERVICE_URL}/api/internal/users/${userId}/kyc-approved`, {
        method: "POST",
      });
    } catch (err) {
      console.error("[Admin Approve] Failed to notify user-service:", err);
    }

    res.json({ message: "KYC application approved successfully." });
  } catch (err: any) {
    console.error("[Admin Approve] Error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/internal/kyc/:userId/reject
router.post("/kyc/:userId/reject", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID." });
      return;
    }

    const app = await KycApplication.findByUserId(userId);
    if (!app) {
      res.status(404).json({ error: "KYC application not found." });
      return;
    }

    const reason = req.body?.reason || "Application rejected by admin.";
    await KycApplication.updateStatus(userId, "REJECTED", reason);

    // Sync user's kyc_status to REJECTED
    await syncUserKycStatus(userId, "REJECTED");

    res.json({ message: "KYC application rejected." });
  } catch (err: any) {
    console.error("[Admin Reject] Error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/internal/kyc/:userId/require
router.post("/kyc/:userId/require", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID." });
      return;
    }
    
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required." });
      return;
    }

    const request = await KycRequest.create(userId, message);
    res.status(201).json(request);
  } catch (err: any) {
    console.error("[Admin Require KYC] Error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/internal/kyc/:userId/requests
router.get("/kyc/:userId/requests", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID." });
      return;
    }

    const requests = await KycRequest.findAllByUserId(userId);
    res.json({ requests });
  } catch (err: any) {
    console.error("[Admin KYC Requests] Error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// DELETE /api/internal/kyc/:userId
router.delete("/kyc/:userId", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID." });
      return;
    }
    await KycApplication.deleteByUserId(userId);
    await KycRequest.deleteByUserId(userId);
    res.json({ message: "User KYC data deleted." });
  } catch (err: any) {
    console.error("[Internal KYC Delete] Error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
