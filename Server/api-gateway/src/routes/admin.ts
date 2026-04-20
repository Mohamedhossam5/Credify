import { Router, Request, Response } from "express";
import express from "express";

const router = Router();
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3001";
const KYC_SERVICE_URL = process.env.KYC_SERVICE_URL || "http://localhost:3002";

// ─── GET /api/admin/dashboard ────────────────────────────────
router.get("/dashboard", async (req: Request, res: Response): Promise<void> => {
  try {
    const [usersRes, kycRes] = await Promise.all([
      fetch(`${USER_SERVICE_URL}/api/internal/users`),
      fetch(`${KYC_SERVICE_URL}/api/internal/kyc/all`)
    ]);

    if (!usersRes.ok || !kycRes.ok) {
      throw new Error("Failed to fetch data from internal services");
    }

    const { users = [] } = (await usersRes.json()) as any;
    const { records = [] } = (await kycRes.json()) as any;

    const merged = users.map((u: any) => {
      const kyc = records.find((k: any) => k.user_id === u.id);
      return {
        ...u,
        face_match_score: kyc ? kyc.face_match_score : null,
        face_match_passed: kyc ? kyc.face_match_passed : null,
        kyc_app_status: kyc ? kyc.status : 'PENDING',
        rejection_reason: kyc ? kyc.rejection_reason : null,
        // Document filenames for admin review
        national_id_front_file: kyc ? kyc.national_id_front_file : null,
        national_id_back_file: kyc ? kyc.national_id_back_file : null,
        face_selfie_file: kyc ? kyc.face_selfie_file : null,
        proof_of_address_file: kyc ? kyc.proof_of_address_file : null,
      };
    });

    res.json({ users: merged });
  } catch (err: any) {
    console.error("[Admin API] Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ─── POST /api/admin/kyc/:userId/approve ─────────────────────
router.post("/kyc/:userId/approve", async (req: Request, res: Response): Promise<void> => {
  try {
    const upstream = await fetch(
      `${KYC_SERVICE_URL}/api/internal/kyc/${req.params.userId}/approve`,
      { method: "POST" }
    );
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err: any) {
    console.error("[Admin API] Approve error:", err.message);
    res.status(502).json({ error: "Upstream service unavailable." });
  }
});

// ─── POST /api/admin/kyc/:userId/reject ──────────────────────
router.post("/kyc/:userId/reject", express.json(), async (req: Request, res: Response): Promise<void> => {
  try {
    const upstream = await fetch(
      `${KYC_SERVICE_URL}/api/internal/kyc/${req.params.userId}/reject`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: req.body?.reason }),
      }
    );
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err: any) {
    console.error("[Admin API] Reject error:", err.message);
    res.status(502).json({ error: "Upstream service unavailable." });
  }
});

// ─── GET /api/admin/kyc/images/:filename ─────────────────────
router.get("/kyc/images/:filename", async (req: Request, res: Response): Promise<void> => {
  try {
    const upstream = await fetch(
      `${KYC_SERVICE_URL}/api/internal/kyc/images/${req.params.filename}`
    );

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: "Image not found." });
      return;
    }

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", contentType);

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch (err: any) {
    console.error("[Admin API] Image proxy error:", err.message);
    res.status(502).json({ error: "Upstream service unavailable." });
  }
});

export default router;
